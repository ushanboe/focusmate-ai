import { useState, useEffect } from 'react';
import { llmService, type ModelInfo } from './llm/LLMService';
import { timerManager, type TaskTimer } from './timer/TimerManager';
import { favoriteManager, type FavoriteBreakdown } from './favorites/FavoriteManager';
import { templateManager, type CustomTemplate } from './templates/TemplateManager';
import type { TaskTemplate } from './templates/TaskTemplates';
import './App.css';

type Tab = 'home' | 'manage' | 'ai' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  // Timer state (shared across tabs)
  const [activeTimer, setActiveTimer] = useState<TaskTimer | null>(null);
  const [showTimerUI, setShowTimerUI] = useState(false);

  // Home tab state
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | CustomTemplate | null>(null);
  const [favoritesList, setFavoritesList] = useState<FavoriteBreakdown[]>([]);

  // AI tab state
  const [taskInput, setTaskInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [breakdown, setBreakdown] = useState<{ response: string; fromCache: boolean; inferenceTime: number } | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Not initialized');
  const [loadProgress, setLoadProgress] = useState('');
  const [cacheStats, setCacheStats] = useState({ size: 0, sizeBytes: 0 });

  // Manage tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | CustomTemplate | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingSteps, setEditingSteps] = useState<Array<{ id: string; description: string; estimatedMinutes: number; optional: boolean }>>([]);

  // Settings state
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [currentModel, setCurrentModel] = useState<ModelInfo | undefined>();
  const [selectedModelId, setSelectedModelId] = useState<string>('');

  // Parsed steps (for AI tab)
  const [steps, setSteps] = useState<string[]>([]);
  const [estimatedTimes, setEstimatedTimes] = useState<number[]>([]);

  // Completion celebration
  const [showCelebration, setShowCelebration] = useState(false);
  const [completionTime, setCompletionTime] = useState<string>('');

  // Update status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(llmService.getStatus());
      setCacheStats(llmService.getCacheStats());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Update timer display every tick
  useEffect(() => {
    const handleTick = (timer: TaskTimer) => {
      setActiveTimer(timer);
    };

    timerManager.onTick(handleTick);

    return () => {
      timerManager.onTick(() => {});
    };
  }, []);

  // Load favorites on mount and when Home or Manage tab is active
  useEffect(() => {
    if (activeTab === 'home' || activeTab === 'manage') {
      setFavoritesList(favoriteManager.getAll());
    }
  }, [activeTab]);

  // Load available models on mount
  useEffect(() => {
    setAvailableModels(llmService.getAvailableModels());
    setCurrentModel(llmService.getCurrentModel());
    setSelectedModelId(llmService.getCurrentModel()?.id || '');
  }, []);

  // Parse breakdown when it changes
  useEffect(() => {
    if (breakdown) {
      const parsed = parseBreakdown(breakdown.response);
      setSteps(parsed.steps);
      setEstimatedTimes(parsed.estimatedTimes);
      console.log('[App] Steps after parse:', parsed.steps.length, 'Estimated:', parsed.estimatedTimes);
    }
  }, [breakdown]);

  const handleInitialize = async () => {
    if (initializing) return;

    setInitializing(true);
    setLoadProgress('Starting...');
    setInitialized(false);

    try {
      const result = await llmService.initialize();
      if (result.success) {
        setInitialized(true);
        setLoadProgress('');
      } else {
        setLoadProgress(result.message || 'Failed to initialize');
      }
    } catch (error) {
      console.error('Initialize error:', error);
      setLoadProgress('Error: ' + (error as Error).message);
    } finally {
      setInitializing(false);
    }
  };

  const handleBreakdown = async () => {
    if (!taskInput.trim()) return;

    if (!initialized) {
      alert('Please initialize the LLM first!');
      return;
    }

    setLoading(true);
    setBreakdown(null);
    setShowTimerUI(false);

    try {
      const result = await llmService.breakdownTask(taskInput);
      setBreakdown(result);
      setCacheStats(llmService.getCacheStats());

      const memory = await llmService.getMemoryUsage();
      setMemoryUsage(memory);
    } catch (error) {
      console.error('LLM Error:', error);
      setBreakdown({
        response: 'Error: Failed to generate breakdown.',
        fromCache: false,
        inferenceTime: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimer = () => {
    if (steps.length === 0) return;

    const timer = timerManager.startTask(
      taskInput,
      steps,
      estimatedTimes
    );

    setActiveTimer(timer);
    setShowTimerUI(true);
  };

  const handleToggleStep = (stepIndex: number) => {
    const updated = timerManager.toggleStep(stepIndex);
    if (updated) {
      setActiveTimer(updated);
    }
  };

  const handleCompleteStep = (stepIndex: number, isComplete: boolean) => {
    console.log(`[App] ◀ handleCompleteStep called: index=${stepIndex}, isComplete=${isComplete}`);
    console.log(`[App] ◀ Before update: step ${stepIndex}.isCompleted = ${activeTimer?.steps[stepIndex]?.isCompleted}`);

    const updated = isComplete
      ? timerManager.completeStep(stepIndex)
      : timerManager.uncompleteStep(stepIndex);

    console.log(`[App] ◀ Updated timer returned:`, updated ? `YES - steps=${updated.steps.length}, step[${stepIndex}].isCompleted=${updated.steps[stepIndex]?.isCompleted}` : 'NO');

    if (updated) {
      setActiveTimer(updated);
      console.log(`[App] ◀ setActiveTimer called with updated state`);
    }

    console.log(`[App] ◀ After setActiveTimer: activeTimer is ${activeTimer ? 'SET' : 'NULL'}`);
  };

  const handleCompleteTask = () => {
    console.log('[App] 🏁 Complete Task button clicked');

    const completed = timerManager.completeTask();
    console.log('[App] 🏁 Completed task returned:', completed ? 'YES' : 'NO');

    if (completed) {
      const totalTime = timerManager.formatTime(completed.totalElapsed);

      setCompletionTime(totalTime);
      setShowCelebration(true);

      console.log('[App] 🏁 Celebration triggered:', totalTime);
      console.log('[App] 🏁 Timer UI will close after celebration');

      setActiveTimer(completed);
      setShowTimerUI(false);
    }
  };

  const handleResetHome = () => {
    if (confirm('Reset this task? This will stop the timer and clear your progress.')) {
      timerManager.stopTask();
      setShowTimerUI(false);
      setActiveTimer(null);
      setSelectedTemplate(null);
      setShowCelebration(false);
      setCompletionTime('');
    }
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    setSelectedTemplate(null);
    setCompletionTime('');
  };

  const handleSaveFavorite = () => {
    if (!breakdown) return;

    favoriteManager.save(
      taskInput,
      breakdown.response,
      estimatedTimes.reduce((sum, t) => sum + t, 0)
    );

    setFavoritesList(favoriteManager.getAll());
    alert('Saved to library!');
  };

  // Template handlers
  const handleUseTemplate = (template: TaskTemplate | CustomTemplate) => {
    // Convert template steps to arrays for timer
    const stepDescriptions = template.steps.map(s => s.description);
    const stepTimes = template.steps.map(s => s.estimatedMinutes);

    timerManager.startTask(
      template.title,
      stepDescriptions,
      stepTimes
    );

    // Record usage
    templateManager.recordUsage(template.id);

    // Set as selected template on Home tab
    setSelectedTemplate(template);
    setShowTimerUI(true);
    setActiveTab('home');
  };

  const handleCloneTemplate = (template: TaskTemplate) => {
    try {
      const cloned = templateManager.cloneTemplate(template.id, `${template.title} (My Version)`);
      setEditingTemplate(cloned);
      setEditingTitle(cloned.title);
      setEditingSteps([...cloned.steps]);
      setShowEditModal(true);
    } catch (e) {
      console.error('[App] Failed to clone template:', e);
      alert('Failed to clone template');
    }
  };

  const handleEditCustomTemplate = (template: CustomTemplate) => {
    setEditingTemplate(template);
    setEditingTitle(template.title);
    setEditingSteps([...template.steps]);
    setShowEditModal(true);
  };

  const handleSaveCustomTemplate = () => {
    if (!editingTemplate) return;

    const customTemplate: CustomTemplate = {
      ...(editingTemplate as CustomTemplate),
      title: editingTitle,
      steps: editingSteps,
      estimatedTotalTime: editingSteps.reduce((sum, s) => sum + s.estimatedMinutes, 0),
      updatedAt: Date.now(),
    };

    templateManager.saveCustomTemplate(customTemplate);
    setShowEditModal(false);
    setEditingTemplate(null);
  };

  const handleAddStep = () => {
    const newStep = {
      id: `step_${Date.now()}`,
      description: '',
      estimatedMinutes: 5,
      optional: false,
    };
    setEditingSteps([...editingSteps, newStep]);
  };

  const handleUpdateStep = (stepId: string, updates: Partial<typeof editingSteps[0]>) => {
    setEditingSteps(editingSteps.map(step =>
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const handleRemoveStep = (stepId: string) => {
    setEditingSteps(editingSteps.filter(step => step.id !== stepId));
  };

  const handleSelectFavorite = (favorite: FavoriteBreakdown) => {
    setTaskInput(favorite.task);
    const parsed = parseBreakdown(favorite.response);

    setBreakdown({
      response: favorite.response,
      fromCache: true,
      inferenceTime: 0,
    });

    setSteps(parsed.steps);
    setEstimatedTimes(parsed.estimatedTimes);
    setShowTimerUI(false);

    // Update last used time
    favoriteManager.touch(favorite.id);
    setFavoritesList(favoriteManager.getAll());
    setActiveTab('ai');
  };

  // Home tab handlers
  const handleStartTemplateTimer = () => {
    if (!selectedTemplate) return;

    const stepDescriptions = selectedTemplate.steps.map(s => s.description);
    const stepTimes = selectedTemplate.steps.map(s => s.estimatedMinutes);

    timerManager.startTask(
      selectedTemplate.title,
      stepDescriptions,
      stepTimes
    );

    templateManager.recordUsage(selectedTemplate.id);
    setShowTimerUI(true);
  };

  const handleUseFavorite = (favorite: FavoriteBreakdown) => {
    // Load favorite as if it's a template
    // For now, we'll start the timer directly with the saved task
    const parsed = parseBreakdown(favorite.response);
    const stepDescriptions = parsed.steps;
    const stepTimes = parsed.estimatedTimes;

    timerManager.startTask(
      favorite.task,
      stepDescriptions,
      stepTimes
    );

    // Update usage
    favoriteManager.touch(favorite.id);
    setFavoritesList(favoriteManager.getAll());

    // Show timer
    setShowTimerUI(true);
  };

  const handleDeleteFavorite = (id: string) => {
    if (confirm('Delete this saved breakdown?')) {
      favoriteManager.remove(id);
      setFavoritesList(favoriteManager.getAll());
    }
  };

  const handleClearCache = () => {
    const beforeCount = cacheStats.size;
    llmService.clearCache();
    const afterCount = llmService.getCacheStats().size;

    const cleared = beforeCount - afterCount;
    if (cleared > 0) {
      alert(`Cleared ${cleared} cached responses`);
      setCacheStats(llmService.getCacheStats());
    } else {
      alert('No cached responses to clear');
    }
  };

  const handleModelChange = (newModelId: string) => {
    setSelectedModelId(newModelId);

    if (initialized) {
      // Model is loaded, will show confirm buttons
    } else {
      // Model not loaded yet, change immediately
      const success = llmService.setModel(newModelId);
      if (success) {
        setCurrentModel(llmService.getCurrentModel());
        alert(`Model changed to ${llmService.getCurrentModel()?.name}. Click Initialize to load it.`);
      }
    }
  };

  const confirmModelChange = () => {
    const success = llmService.setModel(selectedModelId);
    if (success) {
      setCurrentModel(llmService.getCurrentModel());
      setInitialized(false);
      alert(`Model changed to ${llmService.getCurrentModel()?.name}. Click Initialize to load the new model.`);
    }
  };

  const cancelModelChange = () => {
    setSelectedModelId(llmService.getCurrentModel()?.id || '');
  };

  const parseBreakdown = (response: string): { steps: string[]; estimatedTimes: number[] } => {
    const lines = response.split('\n').filter(line => line.trim());
    const steps: string[] = [];
    const times: number[] = [];

    console.log('[App] 🔍 Parsing breakdown with', lines.length, 'lines');

    lines.forEach((line, idx) => {
      console.log(`[App] 🔍 Parsing line ${idx}: "${line.trim()}"`);

      let match: RegExpMatchArray | null;

      // Priority 1: Numbered format "Step 1: Do something (5 min)"
      match = line.match(/^step\s*\d+:\s*([^()]+?)\s*\((\d+)\s*min\)/i);
      if (!match) {
        // Try alternative format "1. Do something (5 min)"
        match = line.match(/^\d+\.\s*([^()]+?)\s*\((\d+)\s*min\)/i);
      }

      if (match) {
        const stepText = match[1].trim();
        const timeText = parseInt(match[2], 10);

        if (stepText.toLowerCase().includes('clear action')) {
          console.log(`[App] Skipped numbered placeholder: "${stepText}"`);
          return;
        }

        steps.push(stepText);
        times.push(timeText);
        console.log(`[App] ✅ Matched numbered step: "${stepText}" (${timeText} min)`);
        return;
      }

      // Priority 2: Bracket format "- [Action] (X min)"
      match = line.match(/^-\s*\[([^\]]+)\]\s*\((\d+)\s*min\)/i);
      if (match) {
        const stepText = match[1].trim();
        const timeText = parseInt(match[2], 10);

        if (stepText.toLowerCase().includes('clear action')) {
          console.log(`[App] Skipped bracket placeholder: "${stepText}"`);
          return;
        }

        steps.push(stepText);
        times.push(timeText);
        console.log(`[App] ✅ Matched bracket step: "${stepText}" (${timeText} min)`);
        return;
      }

      // Priority 3: Bullet format "- Action (X min)"
      match = line.match(/^-\s+([^()]+?)\s*\((\d+)\s*min\)/i);
      if (match) {
        const stepText = match[1].trim();
        const timeText = parseInt(match[2], 10);

        if (stepText.toLowerCase().includes('clear action')) {
          console.log(`[App] Skipped bullet placeholder: "${stepText}"`);
          return;
        }

        steps.push(stepText);
        times.push(timeText);
        console.log(`[App] ✅ Matched bullet step: "${stepText}" (${timeText} min)`);
        return;
      }

      // Fallback: Any line with (X min) that's not indented
      match = line.match(/^[^\s].*?\((\d+)\s*min\)/i);
      if (match) {
        const timeText = parseInt(match[1], 10);
        const stepText = line.replace(/\s*\(\d+\s*min\)/i, '').trim();

        if (stepText && stepText.length > 3 && !stepText.toLowerCase().includes('clear action')) {
          steps.push(stepText);
          times.push(timeText);
          console.log(`[App] ✅ Fallback time extraction: "${stepText}" (${timeText} min)`);
          return;
        }
      }

      console.log(`[App] ⚠️ No match for line ${idx}`);
    });

    console.log(`[App] ✅ Total parsed: ${steps.length} steps`);
    console.log(`[App] Steps:`, steps);
    console.log(`[App] Times:`, times);

    if (steps.length === 0) {
      console.warn(`[App] ⚠️ NO STEPS PARSED - check LLM output format`);
    }

    return { steps, estimatedTimes: times };
  };

  const getProgressPercentage = (): number => {
    if (!activeTimer) return 0;
    const completed = activeTimer.steps.filter(s => s.isCompleted).length;
    return (completed / activeTimer.steps.length) * 100;
  };

  const filteredFavorites = favoritesList.filter(f =>
    !searchQuery || f.task.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Template categories
  const CATEGORIES = [
    { id: 'all', label: 'All', emoji: '📚' },
    { id: 'household', label: 'Household', emoji: '🏠' },
    { id: 'personal', label: 'Personal', emoji: '👤' },
    { id: 'health', label: 'Health', emoji: '💊' },
    { id: 'work', label: 'Work', emoji: '💼' },
    { id: 'social', label: 'Social', emoji: '💬' },
  ];

  // Get filtered templates based on category and search
  const filteredTemplates = templateManager.getAll().filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Render Home Tab
  // Render Home Tab
  const renderHome = () => (
    <div className="tab-content">
      {/* Template Dropdown Selection */}
      <div className="template-selector-section">
        <label className="selector-label">Select a Task Template</label>
        <select
          className="template-dropdown"
          value={selectedTemplate?.id || ''}
          onChange={(e) => {
            const template = templateManager.getTemplate(e.target.value);
            setSelectedTemplate(template || null);
          }}>
          <option value="">-- Choose a task --</option>

          {/* Group templates by category */}
          {['household', 'personal', 'health', 'work', 'social'].map(category => {
            const templates = templateManager.getAll().filter(t => t.category === category);
            if (templates.length === 0) return null;

            return (
              <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.title} ({template.estimatedTotalTime} min)
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>

      {/* Selected Template Display + Timer */}
      {selectedTemplate && (
        <div className="selected-template-display">
          <div className="template-preview-header">
            <h2 className="template-preview-title">{selectedTemplate.title}</h2>
            <div className="template-header-actions">
              <span className="template-time-badge">⏱️ {selectedTemplate.estimatedTotalTime} min</span>
              <button className="reset-button" onClick={handleResetHome}>
                🔄 Reset
              </button>
            </div>
          </div>

          <p className="template-preview-description">{selectedTemplate.description}</p>

          {/* Timer Overview - MOVED HERE (under dropdown) */}
          {showTimerUI && activeTimer && (
            <div className="timer-overview">
              <div className="timer-main-display">
                <div className="total-time">{timerManager.formatTime(activeTimer.totalElapsed)}</div>
                <div className="progress-info">
                  {activeTimer.steps.filter(s => s.isCompleted).length} / {activeTimer.steps.length} completed
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${getProgressPercentage()}%` }} />
              </div>
              <div className="timer-actions-row">
                <button className="ios-button success" onClick={handleCompleteTask}>
                  ✅ Complete
                </button>
                <button className="ios-button danger" onClick={() => {
                  timerManager.stopTask();
                  setShowTimerUI(false);
                  setActiveTimer(null);
                }}>
                  ⏹️ Stop
                </button>
              </div>
            </div>
          )}

          {/* Steps Display */}
          <div className="steps-list">
            {selectedTemplate.steps.map((step, index) => {
              const stepTimer = activeTimer?.steps[index];
              const isCompleted = stepTimer?.isCompleted;
              const isRunning = stepTimer?.isRunning;

              return (
                <div
                  key={step.id}
                  className={`step-card ${isCompleted ? 'completed' : ''} ${isRunning ? 'running' : ''}`}>
                  <div className="step-main">
                    <div className="step-left">
                      <input
                        type="checkbox"
                        className="step-checkbox"
                        checked={!!isCompleted}
                        onChange={(e) => handleCompleteStep(index, e.target.checked)}
                        disabled={step.optional}
                      />
                      {step.optional && <span className="optional-badge">Optional</span>}
                      <span className="step-number">{index + 1}</span>
                    </div>
                    <div className="step-right">
                      <p className="step-text">{step.description}</p>
                      <div className="step-footer">
                        <span className="step-time">⏱️ {step.estimatedMinutes} min</span>
                        {showTimerUI && stepTimer && (
                          <>
                            <span className="step-elapsed">{timerManager.formatTime(stepTimer.elapsedTime)}</span>
                            <button
                              className={`step-toggle ${isRunning ? 'active' : ''}`}
                              onClick={() => handleToggleStep(index)}>
                              {isRunning ? '⏸️' : '▶️'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Start/Stop Timer Button */}
          {!showTimerUI ? (
            <button className="ios-button success full-width" onClick={handleStartTemplateTimer}>
              ▶️ Start Timer
            </button>
          ) : (
            <button className="ios-button danger full-width" onClick={() => {
              timerManager.stopTask();
              setShowTimerUI(false);
              setActiveTimer(null);
            }}>
              ⏹️ Stop Timer
            </button>
          )}
        </div>
      )}

      {/* Saved Tasks List */}
      {favoritesList.length > 0 && (
        <div className="saved-tasks-section">
          <h2 className="section-title">My Saved Tasks</h2>
          <div className="favorites-list">
            {favoritesList.map((favorite) => (
              <div key={favorite.id} className="favorite-card">
                <div className="favorite-content">
                  <h3 className="favorite-title">{favorite.task}</h3>
                  <p className="favorite-meta">
                    ⏱️ {favorite.totalEstimatedTime} min • Used {favorite.usageCount} times
                  </p>
                  <p className="favorite-date">
                    Saved {new Date(favorite.savedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="favorite-actions">
                  <button
                    className="ios-button primary small"
                    onClick={() => handleUseFavorite(favorite)}>
                    Use
                  </button>
                  <button
                    className="ios-icon-button danger"
                    onClick={() => handleDeleteFavorite(favorite.id)}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedTemplate && favoritesList.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>No template selected</p>
          <p className="empty-subtext">Select a task from the dropdown or go to the AI tab to create custom tasks</p>
        </div>
      )}

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="celebration-overlay" onClick={handleCloseCelebration}>
          <div className="celebration-content" onClick={(e) => e.stopPropagation()}>
            <div className="celebration-emoji">🎉</div>
            <h2 className="celebration-title">Task Completed!</h2>
            <p className="celebration-time">Total time: {completionTime}</p>
            <div className="celebration-confetti">
              <div className="confetti confetti-1"></div>
              <div className="confetti confetti-2"></div>
              <div className="confetti confetti-3"></div>
              <div className="confetti confetti-4"></div>
              <div className="confetti confetti-5"></div>
              <div className="confetti confetti-6"></div>
            </div>
            <button className="ios-button primary" onClick={handleCloseCelebration}>
              Great Job! 👏
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Render AI Tab (was Home)
  const renderAI = () => (
    <div className="tab-content">
      <div className="task-input-section">
        <textarea
          className="task-textarea"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder={initialized ? "What task would you like to break down?" : "Initialize the model to get started..."}
          disabled={!initialized || loading}
          rows={3}
        />
      </div>

      <div className="actions-section">
        {!initialized && !initializing && (
          <button className="ios-button primary" onClick={handleInitialize}>
            Initialize Model
          </button>
        )}

        {initializing && (
          <div className="loading-container">
            <div className="spinner" />
            <p className="loading-text">
              {loadProgress || 'Downloading model (~2.2GB)...'}
            </p>
          </div>
        )}

        {(initialized || showTimerUI) && (
          <button
            className={`ios-button primary ${!taskInput.trim() || loading ? 'disabled' : ''}`}
            onClick={handleBreakdown}
            disabled={!taskInput.trim() || loading}>
            {loading ? <div className="spinner-small" /> : 'Break It Down'}
          </button>
        )}

        {showTimerUI && (
          <button className="ios-button danger" onClick={() => {
            timerManager.stopTask();
            setShowTimerUI(false);
            setActiveTimer(null);
          }}>
            Cancel Timer
          </button>
        )}
      </div>

      {breakdown && (
        <div className="breakdown-section">
          <div className="breakdown-header">
            <h2>Breakdown</h2>
            <button className="ios-icon-button" onClick={handleSaveFavorite}>
              ⭐ Save
            </button>
          </div>

          {!showTimerUI && (
            <div className="breakdown-stats">
              <span>⏱️ {breakdown.inferenceTime.toFixed(0)}ms</span>
              {breakdown.fromCache && <span className="cache-tag">💾 Cached</span>}
            </div>
          )}

          {showTimerUI && activeTimer && (
            <div className="timer-overview">
              <div className="timer-main-display">
                <div className="total-time">{timerManager.formatTime(activeTimer.totalElapsed)}</div>
                <div className="progress-info">
                  {activeTimer.steps.filter(s => s.isCompleted).length} / {activeTimer.steps.length} completed
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${getProgressPercentage()}%` }} />
              </div>
              <div className="timer-actions-row">
                <button className="ios-button success" onClick={handleCompleteTask}>
                  ✅ Complete
                </button>
              </div>
            </div>
          )}

          <div className="steps-list">
            {steps.map((step, index) => {
              const stepTimer = activeTimer?.steps[index];
              const isCompleted = stepTimer?.isCompleted;
              const isRunning = stepTimer?.isRunning;

              return (
                <div
                  key={index}
                  className={`step-card ${isCompleted ? 'completed' : ''} ${isRunning ? 'running' : ''}`}
                >
                  <div className="step-main">
                    <div className="step-left">
                      <input
                        type="checkbox"
                        className="step-checkbox"
                        checked={!!isCompleted}
                        onChange={(e) => handleCompleteStep(index, e.target.checked)}
                      />
                      <span className="step-number">{index + 1}</span>
                    </div>
                    <div className="step-right">
                      <p className="step-text">{step}</p>
                      <div className="step-footer">
                        <span className="step-time">⏱️ {estimatedTimes[index]} min</span>
                        {showTimerUI && stepTimer && (
                          <>
                            <span className="step-elapsed">{timerManager.formatTime(stepTimer.elapsedTime)}</span>
                            <button
                              className={`step-toggle ${isRunning ? 'active' : ''}`}
                              onClick={() => handleToggleStep(index)}>
                              {isRunning ? '⏸️' : '▶️'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!showTimerUI && steps.length > 0 && (
            <button className="ios-button success full-width" onClick={handleStartTimer}>
              ▶️ Start Timer
            </button>
          )}
        </div>
      )}
    </div>
  );

  // Render Manage Tab (was Library)
  const renderManage = () => (
    <div className="tab-content">
      {/* Search Bar */}
      <div className="search-bar">
        <input
          className="search-input"
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}>
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Templates Section */}
      {(selectedCategory === 'all' || selectedCategory !== 'all') && (
        <div className="library-section">
          <h2 className="section-title">
            {selectedCategory === 'all' ? 'All Tasks' : CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Tasks'}
          </h2>

          {filteredTemplates.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No tasks found</p>
              <p className="empty-subtext">Try a different category or search term</p>
            </div>
          ) : (
            <div className="templates-grid">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="template-card">
                  <div className="template-header">
                    <h3 className="template-title">{template.title}</h3>
                    <span className={`template-difficulty difficulty-${template.difficulty}`}>
                      {template.difficulty}
                    </span>
                  </div>

                  <p className="template-description">{template.description}</p>

                  <div className="template-meta">
                    <span className="template-time">⏱️ {template.estimatedTotalTime} min</span>
                    <span className="template-steps">📝 {template.steps.length} steps</span>
                  </div>

                  {template.tips && template.tips.length > 0 && (
                    <div className="template-tips">
                      <strong>💡 Tips:</strong>
                      <ul>
                        {template.tips.slice(0, 2).map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {template.accessibilityNotes && (
                    <div className="template-accessibility">
                      <strong>♿ Accessibility:</strong> {template.accessibilityNotes}
                    </div>
                  )}

                  <div className="template-actions">
                    <button
                      className="ios-button primary small"
                      onClick={() => handleUseTemplate(template)}>
                      Use Template
                    </button>

                    {('isUserCustomized' in template) ? (
                      <button
                        className="ios-button secondary small"
                        onClick={() => handleEditCustomTemplate(template as CustomTemplate)}>
                        Edit
                      </button>
                    ) : (
                      <button
                        className="ios-button secondary small"
                        onClick={() => handleCloneTemplate(template)}>
                        Clone & Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Favorites Section (only when 'all' is selected) */}
      {selectedCategory === 'all' && filteredFavorites.length > 0 && (
        <div className="library-section">
          <h2 className="section-title">My Favorites</h2>
          <div className="favorites-list">
            {filteredFavorites.map((favorite) => (
              <div key={favorite.id} className="favorite-card">
                <div className="favorite-content">
                  <h3 className="favorite-title">{favorite.task}</h3>
                  <p className="favorite-meta">
                    ⏱️ {favorite.totalEstimatedTime} min • Used {favorite.usageCount} times
                  </p>
                  <p className="favorite-date">
                    Saved {new Date(favorite.savedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="favorite-actions">
                  <button
                    className="ios-button secondary"
                    onClick={() => handleSelectFavorite(favorite)}>
                    Use
                  </button>
                  <button
                    className="ios-icon-button danger"
                    onClick={() => handleDeleteFavorite(favorite.id)}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Template</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="edit-field">
                <label>Title</label>
                <input
                  className="edit-input"
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  placeholder="Task title..."
                />
              </div>

              <div className="edit-field">
                <label>Steps</label>
                {editingSteps.map((step, idx) => (
                  <div key={step.id} className="edit-step">
                    <div className="edit-step-number">{idx + 1}</div>

                    <div className="edit-step-content">
                      <input
                        className="edit-input"
                        type="text"
                        value={step.description}
                        onChange={(e) => handleUpdateStep(step.id, { description: e.target.value })}
                        placeholder={`Step ${idx + 1}...`}
                      />

                      <div className="edit-step-meta">
                        <input
                          className="edit-time-input"
                          type="number"
                          value={step.estimatedMinutes}
                          onChange={(e) => handleUpdateStep(step.id, { estimatedMinutes: parseInt(e.target.value) || 1 })}
                          min="1"
                        />
                        <span>min</span>

                        <label className="edit-checkbox">
                          <input
                            type="checkbox"
                            checked={step.optional}
                            onChange={(e) => handleUpdateStep(step.id, { optional: e.target.checked })}
                          />
                          Optional
                        </label>

                        <button
                          className="edit-delete-btn"
                          onClick={() => handleRemoveStep(step.id)}
                          disabled={editingSteps.length <= 1}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button className="ios-button secondary full-width" onClick={handleAddStep}>
                  + Add Step
                </button>
              </div>

              <div className="edit-summary">
                <strong>Total Time:</strong> {editingSteps.reduce((sum, s) => sum + s.estimatedMinutes, 0)} min
              </div>
            </div>

            <div className="modal-footer">
              <button className="ios-button secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="ios-button primary" onClick={handleSaveCustomTemplate}>
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render Settings Tab
  const renderSettings = () => (
    <div className="tab-content">
      <div className="settings-group">
        <h3>Model Selection</h3>
        <div className="setting-description">
          Choose a model based on your phone's RAM. Larger models give better quality but require more memory.
        </div>
        <div className="model-selector">
          {availableModels.map((model) => (
            <div
              key={model.id}
              className={`model-option ${selectedModelId === model.id ? 'selected' : ''}`}
              onClick={() => handleModelChange(model.id)}
            >
              <div className="model-header">
                <input
                  type="radio"
                  name="model"
                  checked={selectedModelId === model.id}
                  onChange={() => handleModelChange(model.id)}
                  className="model-radio"
                />
                <div className="model-name">
                  <strong>{model.name}</strong>
                  <span className="model-params">{model.params}</span>
                </div>
                {selectedModelId === model.id && <span className="model-check">✓</span>}
              </div>
              <div className="model-details">
                <div className="model-detail">
                  <span className="detail-label">Size:</span>
                  <span className="detail-value">{model.size}</span>
                </div>
                <div className="model-detail">
                  <span className="detail-label">Min RAM:</span>
                  <span className="detail-value">{model.minRam}</span>
                </div>
              </div>
              <p className="model-description-text">{model.description}</p>
            </div>
          ))}
        </div>
        {initialized && selectedModelId !== llmService.getCurrentModel()?.id && (
          <div className="model-change-actions">
            <button className="ios-button primary" onClick={confirmModelChange}>
              Change & Reinitialize
            </button>
            <button className="ios-button secondary" onClick={cancelModelChange}>
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="settings-group">
        <h3>Current Model Status</h3>
        <div className="setting-item">
          <span className="setting-label">Model</span>
          <span className="setting-value">{currentModel?.name || 'Loading...'}</span>
        </div>
        <div className="setting-item">
          <span className="setting-label">Status</span>
          <span className="setting-value">{status}</span>
        </div>
        {memoryUsage && (
          <div className="setting-item">
            <span className="setting-label">Memory</span>
            <span className="setting-value">{memoryUsage}</span>
          </div>
        )}
        {cacheStats.size > 0 && (
          <div className="setting-item">
            <span className="setting-label">Cache</span>
            <span className="setting-value">{cacheStats.size} responses</span>
          </div>
        )}
      </div>

      <div className="settings-group">
        <h3>Cache Management</h3>
        <div className="setting-item">
          <span className="setting-label">Cached Responses</span>
          <span className="setting-value">{cacheStats.size}</span>
        </div>
        <div className="setting-item">
          <span className="setting-label">Cache Size</span>
          <span className="setting-value">{(cacheStats.sizeBytes / 1024).toFixed(1)} KB</span>
        </div>
        <button className="ios-button danger" onClick={handleClearCache}>
          Clear Cache
        </button>
      </div>

      <div className="settings-group">
        <h3>About</h3>
        <div className="setting-item">
          <span className="setting-label">Version</span>
          <span className="setting-value">1.0.0</span>
        </div>
        <div className="setting-item">
          <span className="setting-label">Platform</span>
          <span className="setting-value">Native App</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ios-app">
      <div className="ios-header">
        <h1>FocusMate AI</h1>
      </div>

      <div className="ios-content">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'manage' && renderManage()}
        {activeTab === 'ai' && renderAI()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      <div className="ios-tab-bar">
        <button
          className={`tab-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}>
          <span className="tab-icon">🏠</span>
          <span className="tab-label">Home</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}>
          <span className="tab-icon">🔧</span>
          <span className="tab-label">Manage</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}>
          <span className="tab-icon">🤖</span>
          <span className="tab-label">AI</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}>
          <span className="tab-icon">⚙️</span>
          <span className="tab-label">Settings</span>
        </button>
      </div>
    </div>
  );
}

export default App;