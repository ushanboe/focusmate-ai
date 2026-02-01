/**
 * TemplateManager - Manage pre-loaded and user-customized task templates
 *
 * Handles loading pre-loaded templates, saving user customizations,
 * and combining both sources for the library.
 */

import { type TaskTemplate, PRELOADED_TEMPLATES, getTemplateById } from './TaskTemplates';

export interface CustomTemplate {
  id: string;
  originalId?: string; // If cloned from pre-loaded template
  title: string;
  category: TaskTemplate['category'];
  difficulty: TaskTemplate['difficulty'];
  estimatedTotalTime: number;
  description: string;
  tips?: string[];
  steps: Array<{
    id: string;
    description: string;
    estimatedMinutes: number;
    optional: boolean;
  }>;
  accessibilityNotes?: string;
  createdAt: number;
  updatedAt: number;
  useCount: number;
  isUserCustomized: boolean;
  isFavorite: boolean;
}

export class TemplateManager {
  private static instance: TemplateManager;
  private customTemplates: Map<string, CustomTemplate> = new Map();
  private storageKey = 'focusmate_custom_templates';

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): TemplateManager {
    if (!TemplateManager.instance) {
      TemplateManager.instance = new TemplateManager();
    }
    return TemplateManager.instance;
  }

  /**
   * Get all templates (pre-loaded + custom)
   */
  getAll(): Array<TaskTemplate | CustomTemplate> {
    const custom = Array.from(this.customTemplates.values());
    return [...PRELOADED_TEMPLATES, ...custom];
  }

  /**
   * Get pre-loaded templates only
   */
  getPreloadedTemplates(): TaskTemplate[] {
    return PRELOADED_TEMPLATES;
  }

  /**
   * Get user-customized templates only
   */
  getCustomTemplates(): CustomTemplate[] {
    return Array.from(this.customTemplates.values()).sort(
      (a, b) => b.updatedAt - a.updatedAt
    );
  }

  /**
   * Get template by ID (checks both pre-loaded and custom)
   */
  getTemplate(id: string): TaskTemplate | CustomTemplate | null {
    // Check pre-loaded first
    const preloaded = getTemplateById(id);
    if (preloaded) return preloaded;

    // Then check custom
    return this.customTemplates.get(id) || null;
  }

  /**
   Clone a pre-loaded template as a custom template
   */
  cloneTemplate(preloadedId: string, newTitle?: string): CustomTemplate {
    const preloaded = getTemplateById(preloadedId);
    if (!preloaded) {
      throw new Error(`Template not found: ${preloadedId}`);
    }

    const custom: CustomTemplate = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalId: preloadedId,
      title: newTitle || preloaded.title,
      category: preloaded.category,
      difficulty: preloaded.difficulty,
      estimatedTotalTime: preloaded.estimatedTotalTime,
      description: preloaded.description,
      tips: preloaded.tips ? [...preloaded.tips] : [],
      steps: preloaded.steps.map((step, idx) => ({
        id: `step_${idx}`,
        description: step.description,
        estimatedMinutes: step.estimatedMinutes,
        optional: step.optional,
      })),
      accessibilityNotes: preloaded.accessibilityNotes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      useCount: 0,
      isUserCustomized: true,
      isFavorite: false,
    };

    this.customTemplates.set(custom.id, custom);
    this.saveToStorage();

    console.log(`[TemplateManager] Cloned template: "${preloaded.title}" → "${custom.title}"`);
    return custom;
  }

  /**
   * Save or update a custom template
   */
  saveCustomTemplate(template: CustomTemplate): void {
    const now = Date.now();
    const updated: CustomTemplate = {
      ...template,
      updatedAt: now,
      // If it's a new template (no createdAt), set it
      createdAt: template.createdAt || now,
      // Ensure it's marked as user customized
      isUserCustomized: true,
    };

    this.customTemplates.set(updated.id, updated);
    this.saveToStorage();

    console.log(`[TemplateManager] Saved custom template: "${updated.title}"`);
  }

  /**
   * Update step in a custom template
   */
  updateStep(templateId: string, stepId: string, updates: {
    description?: string;
    estimatedMinutes?: number;
    optional?: boolean;
  }): boolean {
    const template = this.customTemplates.get(templateId);
    if (!template) return false;

    const stepIndex = template.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return false;

    template.steps[stepIndex] = {
      ...template.steps[stepIndex],
      ...updates,
    };

    // Re-calculate total time
    template.estimatedTotalTime = template.steps.reduce((sum, s) => sum + s.estimatedMinutes, 0);

    this.saveToStorage();
    return true;
  }

  /**
   * Add step to custom template
   */
  addStep(templateId: string, step: {
    description: string;
    estimatedMinutes: number;
    optional?: boolean;
  }): string {
    const template = this.customTemplates.get(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const stepId = `step_${template.steps.length}_${Date.now()}`;

    template.steps.push({
      id: stepId,
      ...step,
      optional: step.optional || false,
    });

    // Re-calculate total time
    template.estimatedTotalTime = template.steps.reduce((sum, s) => sum + s.estimatedMinutes, 0);

    this.saveToStorage();
    return stepId;
  }

  /**
   * Remove step from custom template
   */
  removeStep(templateId: string, stepId: string): boolean {
    const template = this.customTemplates.get(templateId);
    if (!template) return false;

    const stepIndex = template.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return false;

    template.steps.splice(stepIndex, 1);

    // Re-calculate total time
    template.estimatedTotalTime = template.steps.reduce((sum, s) => sum + s.estimatedMinutes, 0);

    this.saveToStorage();
    return true;
  }

  /**
   * Reorder steps in custom template
   */
  reorderSteps(templateId: string, fromIndex: number, toIndex: number): boolean {
    const template = this.customTemplates.get(templateId);
    if (!template) return false;

    const [moved] = template.steps.splice(fromIndex, 1);
    template.steps.splice(toIndex, 0, moved);

    this.saveToStorage();
    return true;
  }

  /**
   * Delete a custom template
   */
  deleteTemplate(id: string): boolean {
    const deleted = this.customTemplates.delete(id);
    if (deleted) {
      this.saveToStorage();
      console.log(`[TemplateManager] Deleted custom template: ${id}`);
    }
    return deleted;
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(id: string): boolean {
    const template = this.customTemplates.get(id);
    if (!template) return false;

    template.isFavorite = !template.isFavorite;
    this.saveToStorage();
    return template.isFavorite;
  }

  /**
   * Record usage of a template
   */
  recordUsage(id: string): void {
    // Check custom templates
    const custom = this.customTemplates.get(id);
    if (custom) {
      custom.useCount++;
      this.saveToStorage();
      return;
    }

    // Could also track usage for pre-loaded templates in localStorage
    // For now, we'll focus on custom templates
  }

  /**
   * Get favorites only
   */
  getFavorites(): Array<TaskTemplate | CustomTemplate> {
    const all = this.getAll();
    return all.filter(t => 'isFavorite' in t ? t.isFavorite : false);
  }

  /**
   * Search all templates
   */
  search(query: string): Array<TaskTemplate | CustomTemplate> {
    const q = query.toLowerCase();
    return this.getAll().filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.steps.some(s => s.description.toLowerCase().includes(q))
    );
  }

  /**
   * Get recently used
   */
  getRecentlyUsed(limit: number = 10): Array<TaskTemplate | CustomTemplate> {
    const customSorted = this.getCustomTemplates()
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, limit);

    return customSorted;
  }

  /**
   * Load custom templates from localStorage
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return;

      const templates = JSON.parse(data) as [string, CustomTemplate][];
      const templateMap = new Map<string, CustomTemplate>();

      for (const [id, template] of templates) {
        templateMap.set(id, template);
      }

      this.customTemplates = templateMap;
      console.log(`[TemplateManager] Loaded ${templateMap.size} custom templates from storage`);
    } catch (e) {
      console.error('[TemplateManager] Failed to load from storage:', e);
    }
  }

  /**
   * Save custom templates to localStorage
   */
  private saveToStorage(): void {
    try {
      const entries = Array.from(this.customTemplates.entries());
      const data = JSON.stringify(entries);
      localStorage.setItem(this.storageKey, data);
    } catch (e) {
      console.error('[TemplateManager] Failed to save to storage:', e);

      // If storage is full, try clearing old templates
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        this.pruneOldest(5);
        this.saveToStorage();
      }
    }
  }

  /**
   * Prune oldest custom templates (least recently updated)
   */
  private pruneOldest(count: number): void {
    const entries = Array.from(this.customTemplates.entries());
    entries.sort((a, b) => a[1].updatedAt - b[1].updatedAt);

    const toRemove = entries.slice(0, count);
    for (const [id] of toRemove) {
      this.customTemplates.delete(id);
    }

    console.log(`[TemplateManager] Pruned ${toRemove.length} oldest custom templates`);
  }

  /**
   * Get stats
   */
  getStats(): {
    totalPreloaded: number;
    totalCustom: number;
    totalFavorites: number;
    totalUsage: number;
  } {
    const custom = this.getCustomTemplates();
    const favorites = this.getFavorites();
    const totalUsage = custom.reduce((sum, t) => sum + t.useCount, 0);

    return {
      totalPreloaded: PRELOADED_TEMPLATES.length,
      totalCustom: custom.length,
      totalFavorites: favorites.length,
      totalUsage,
    };
  }
}

// Export singleton instance
export const templateManager = TemplateManager.getInstance();
console.log('[TemplateManager] Exported templateManager singleton');