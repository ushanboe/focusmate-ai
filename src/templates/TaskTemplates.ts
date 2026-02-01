/**
 * Pre-loaded Task Templates
 *
 * Curated task lists for ADHD users, forgetful adults, and dementia patients
 * Each task is pre-configured with realistic times and steps
 */

export interface TaskTemplate {
  id: string;
  title: string;
  category: 'household' | 'personal' | 'health' | 'work' | 'social';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTotalTime: number; // in minutes
  description: string;
  tips?: string[];
  steps: Array<{
    id: string;
    description: string;
    estimatedMinutes: number;
    optional: boolean;
  }>;
  accessibilityNotes?: string; // Extra help for dementia patients
}

export const PRELOADED_TEMPLATES: TaskTemplate[] = [
  // ==================== HOUSEHOLD CHORES ====================

  {
    id: 'household_clean_kitchen',
    title: 'Clean Kitchen',
    category: 'household',
    difficulty: 'medium',
    estimatedTotalTime: 30,
    description: 'Daily kitchen cleanup after meals',
    tips: ['Do right after eating to prevent food from drying', 'Play music or a podcast'],
    steps: [
      { id: '1', description: 'Load dirty dishes into dishwasher', estimatedMinutes: 5, optional: false },
      { id: '2', description: 'Wipe down dining table', estimatedMinutes: 3, optional: false },
      { id: '3', description: 'Rinse sink and wipe basin', estimatedMinutes: 2, optional: false },
      { id: '4', description: 'Wipe down countertops', estimatedMinutes: 5, optional: false },
      { id: '5', description: 'Empty small trash can if full', estimatedMinutes: 2, optional: true },
      { id: '6', description: 'Store leftovers in containers', estimatedMinutes: 5, optional: true },
      { id: '7', description: 'Start dishwasher if full', estimatedMinutes: 2, optional: false },
    ],
    accessibilityNotes: 'Clear sink and countertop clutter beforehand. Use bright lighting.',
  },

  {
    id: 'household_clean_bedroom',
    title: 'Tidy Bedroom',
    category: 'household',
    difficulty: 'easy',
    estimatedTotalTime: 20,
    description: 'Quick bedroom cleanup',
    steps: [
      { id: '1', description: 'Make bed - straighten sheets and pillows', estimatedMinutes: 3, optional: false },
      { id: '2', description: 'Pick up clothes and put in laundry basket', estimatedMinutes: 5, optional: false },
      { id: '3', description: 'Clear bedside table (glasses, water, books)', estimatedMinutes: 2, optional: false },
      { id: '4', description: 'Hang up coats or put in closet', estimatedMinutes: 3, optional: true },
      { id: '5', description: 'Empty small trash can', estimatedMinutes: 1, optional: true },
      { id: '6', description: 'Open windows for fresh air', estimatedMinutes: 1, optional: true },
    ],
  },

  {
    id: 'household_laundry_start',
    title: 'Start Laundry',
    category: 'household',
    difficulty: 'easy',
    estimatedTotalTime: 15,
    description: 'Sort and load laundry into washing machine',
    tips: ['Sort darks and lights', 'Check pockets for items', 'Don\'t overload the machine'],
    steps: [
      { id: '1', description: 'Gather all dirty laundry from bedroom/bathroom', estimatedMinutes: 5, optional: false },
      { id: '2', description: 'Sort by color (darks, lights, delicates)', estimatedMinutes: 3, optional: false },
      { id: '3', description: 'Check pockets for forgotten items', estimatedMinutes: 2, optional: false },
      { id: '4', description: 'Load washer (don\'t overfill)', estimatedMinutes: 2, optional: false },
      { id: '5', description: 'Add detergent', estimatedMinutes: 1, optional: false },
      { id: '6', description: 'Select cycle and start machine', estimatedMinutes: 1, optional: false },
    ],
  },

  {
    id: 'household_mow_lawn',
    title: 'Mow the Lawn',
    category: 'household',
    difficulty: 'hard',
    estimatedTotalTime: 60,
    description: 'Mow the front and/or back lawn',
    tips: ['Wear protective eyewear', 'Mow when grass is dry', 'Check for debris before starting', 'Take breaks as needed'],
    steps: [
      { id: '1', description: 'Gather tools: mower, gas or extension cord, safety gear', estimatedMinutes: 10, optional: false },
      { id: '2', description: 'Remove debris: toys, stones, branches from lawn', estimatedMinutes: 10, optional: false },
      { id: '3', description: 'Check or fill with gas/oil if needed', estimatedMinutes: 5, optional: false },
      { id: '4', description: 'Start lawn mower', estimatedMinutes: 2, optional: false },
      { id: '5', description: 'Mow lawn in straight lines', estimatedMinutes: 20, optional: false },
      { id: '6', description: 'Stop mower, let cool down', estimatedMinutes: 5, optional: false },
      { id: '7', description: 'Clean mower and store in shed/garage', estimatedMinutes: 5, optional: false },
      { id: '8', description: 'Clean up any grass clippings', estimatedMinutes: 3, optional: true },
    ],
    accessibilityNotes: 'Consider getting help on very hot days or for large lawns. Wear hearing protection.',
  },

  {
    id: 'household_dishes_wash',
    title: 'Wash Dishes by Hand',
    category: 'household',
    difficulty: 'medium',
    estimatedTotalTime: 25,
    description: 'Hand-wash dishes when dishwasher isn\'t available',
    steps: [
      { id: '1', description: 'Scrape food scraps into trash or compost', estimatedMinutes: 3, optional: false },
      { id: '2', description: 'Fill sink with warm soapy water', estimatedMinutes: 2, optional: false },
      { id: '3', description: 'Wash glasses and cups first', estimatedMinutes: 5, optional: false },
      { id: '4', description: 'Wash plates and bowls', estimatedMinutes: 5, optional: false },
      { id: '5', description: 'Wash silverware', estimatedMinutes: 3, optional: false },
      { id: '6', description: 'Rinse everything with clean water', estimatedMinutes: 3, optional: false },
      { id: '7', description: 'Dry with towel or let air dry', estimatedMinutes: 2, optional: false },
      { id: '8', description: 'Put everything away in cupboards', estimatedMinutes: 2, optional: false },
    ],
  },

  {
    id: 'household_vacuum',
    title: 'Vacuum Floors',
    category: 'household',
    difficulty: 'easy',
    estimatedTotalTime: 25,
    description: 'Vacuum carpets and rugs in main living areas',
    tips: ['Move small furniture first', 'Empty canister when half full', 'Use attachments for edges and corners'],
    steps: [
      { id: '1', description: 'Pick up small items from floor (toys, clothes)', estimatedMinutes: 5, optional: false },
      { id: '2', description: 'Move light furniture if needed', estimatedMinutes: 3, optional: true },
      { id: '3', description: 'Get vacuum cleaner and check cord/cordless charge', estimatedMinutes: 2, optional: false },
      { id: '4', description: 'Vacuum main living area in straight lines', estimatedMinutes: 8, optional: false },
      { id: '5', description: 'Vacuum hallways and doorway edges', estimatedMinutes: 3, optional: false },
      { id: '6', description: 'Use attachment for corners and under furniture', estimatedMinutes: 2, optional: true },
      { id: '7', description: 'Empty canister or change bag', estimatedMinutes: 1, optional: false },
      { id: '8', description: 'Store vacuum away', estimatedMinutes: 1, optional: false },
    ],
  },

  // ==================== PERSONAL CARE ====================

  {
    id: 'personal_morning_routine',
    title: 'Morning Routine',
    category: 'personal',
    difficulty: 'easy',
    estimatedTotalTime: 45,
    description: 'Start your day right with a consistent morning routine',
    tips: ['Prepare clothes night before', 'Set alarm for consistent wake time', 'Avoid checking phone first thing'],
    steps: [
      { id: '1', description: 'Wake up - turn off alarm and get out of bed', estimatedMinutes: 2, optional: false },
      { id: '2', description: 'Brush teeth and rinse', estimatedMinutes: 3, optional: false },
      { id: '3', description: 'Wash face with water and cleanser', estimatedMinutes: 2, optional: false },
      { id: '4', description: 'Get dressed (outfits ready from night before)', estimatedMinutes: 5, optional: false },
      { id: '5', description: 'Drink a glass of water - hydrate', estimatedMinutes: 1, optional: false },
      { id: '6', description: 'Eat breakfast or prepare breakfast to go', estimatedMinutes: 15, optional: false },
      { id: '7', description: 'Take daily medications if any', estimatedMinutes: 2, optional: true },
      { id: '8', description: 'Gather bag, keys, phone, wallet before leaving', estimatedMinutes: 3, optional: true },
      { id: '9', description: 'Lock door and head out', estimatedMinutes: 2, optional: true },
    ],
    accessibilityNotes: 'Consider a checklist by the bedside. Use bright lighting in bathroom.',
  },

  {
    id: 'personal_evening_routine',
    title: 'Evening Routine',
    category: 'personal',
    difficulty: 'easy',
    estimatedTotalTime: 45,
    description: 'Wind down for better sleep quality',
    tips: ['Avoid screens 30 min before bed', 'Keep room cool and dark', 'Consistent bedtime is key'],
    steps: [
      { id: '1', description: 'Clean up kitchen from dinner', estimatedMinutes: 10, optional: false },
      { id: '2', description: 'Prepare clothes for tomorrow', estimatedMinutes: 5, optional: false },
      { id: '3', description: 'Pack for tomorrow (work bag, lunch)', estimatedMinutes: 5, optional: true },
      { id: '4', description: 'Set alarm for tomorrow morning', estimatedMinutes: 1, optional: false },
      { id: '5', description: 'Shower or wash face', estimatedMinutes: 10, optional: false },
      { id: '6', description: 'Brush teeth', estimatedMinutes: 3, optional: false },
      { id: '7', description: 'Take evening medications if any', estimatedMinutes: 2, optional: true },
      { id: '8', description: 'Read or do a relaxing activity (no screens)', estimatedMinutes: 15, optional: true },
      { id: '9', description: 'Turn off lights and go to bed', estimatedMinutes: 1, optional: false },
    ],
  },

  {
    id: 'personal_shower',
    title: 'Take a Shower',
    category: 'personal',
    difficulty: 'easy',
    estimatedTotalTime: 20,
    description: 'Complete shower and getting dressed',
    steps: [
      { id: '1', description: 'Gather clean clothes and towel', estimatedMinutes: 2, optional: false },
      { id: '2', description: 'Remove clothes and turn on water', estimatedMinutes: 1, optional: false },
      { id: '3', description: 'Shampoo hair and rinse', estimatedMinutes: 3, optional: false },
      { id: '4', description: 'Wash body with soap', estimatedMinutes: 5, optional: false },
      { id: '5', description: 'Rinse thoroughly', estimatedMinutes: 2, optional: false },
      { id: '6', description: 'Turn off water and dry off with towel', estimatedMinutes: 2, optional: false },
      { id: '7', description: 'Get dressed', estimatedMinutes: 3, optional: false },
      { id: '8', description: 'Hang up towel', estimatedMinutes: 1, optional: false },
    ],
    accessibilityNotes: 'Use non-slip mat in shower. Consider grab bars for safety.',
  },

  {
    id: 'personal_pack_bag',
    title: 'Pack Work/School Bag',
    category: 'personal',
    difficulty: 'easy',
    estimatedTotalTime: 15,
    description: 'Pack your bag for the next day',
    tips: ['Make a checklist and keep it visible', 'Pack night before if possible', 'Check weather forecast'],
    steps: [
      { id: '1', description: 'Get bag and check contents', estimatedMinutes: 2, optional: false },
      { id: '2', description: 'Add laptop/tablet', estimatedMinutes: 1, optional: true },
      { id: '3', description: 'Add necessary papers or books', estimatedMinutes: 3, optional: true },
      { id: '4', description: 'Add charging cables', estimatedMinutes: 1, optional: false },
      { id: '5', description: 'Add water bottle and snacks', estimatedMinutes: 2, optional: true },
      { id: '6', description: 'Add any homework or work files', estimatedMinutes: 3, optional: true },
      { id: '7', description: 'Double-check list against daily needs', estimatedMinutes: 2, optional: false },
      { id: '8', description: 'Place bag by door', estimatedMinutes: 1, optional: false },
    ],
    accessibilityNotes: 'Create a laminated checklist to review each time.',
  },

  // ==================== HEALTH & MEDICINE ====================

  {
    id: 'health_morning_meds',
    title: 'Take Morning Medications',
    category: 'health',
    difficulty: 'easy',
    estimatedTotalTime: 10,
    description: 'Take prescribed morning medications',
    tips: ['Use a weekly pill organizer', 'Set daily reminder alarm', 'Keep pill organizer visible'],
    steps: [
      { id: '1', description: 'Get pill organizer', estimatedMinutes: 1, optional: false },
      { id: '2', description: 'Get a glass of water', estimatedMinutes: 1, optional: false },
      { id: '3', description: 'Open today\'s compartments', estimatedMinutes: 2, optional: false },
      { id: '4', description: 'Take each medication with water', estimatedMinutes: 3, optional: false },
      { id: '5', description: 'Close compartments', estimatedMinutes: 1, optional: false },
      { id: '6', description: 'Put pill organizer back on counter', estimatedMinutes: 1, optional: false },
      { id: '7', description: 'Check off on medication tracker if using', estimatedMinutes: 1, optional: true },
    ],
    accessibilityNotes: 'Critical for patients with memory issues. Use caregiver verification if possible.',
  },

  {
    id: 'health_evening_meds',
    title: 'Take Evening Medications',
    category: 'health',
    difficulty: 'easy',
    estimatedTotalTime: 10,
    description: 'Take prescribed evening/nighttime medications',
    steps: [
      { id: '1', description: 'Get pill organizer', estimatedMinutes: 1, optional: false },
      { id: '2', description: 'Get a glass of water', estimatedMinutes: 1, optional: false },
      { id: '3', description: 'Open today\'s evening compartments', estimatedMinutes: 2, optional: false },
      { id: '4', description: 'Take each medication with water', estimatedMinutes: 3, optional: false },
      { id: '5', description: 'Close compartments', estimatedMinutes: 1, optional: false },
      { id: '6', description: 'Put pill organizer back on counter', estimatedMinutes: 1, optional: false },
      { id: '7', description: 'Check off on medication tracker if using', estimatedMinutes: 1, optional: true },
    ],
    accessibilityNotes: 'Set reminder timer on phone. Keep organizer next to bed.',
  },

  {
    id: 'health_exercise_walking',
    title: 'Go for a Walk',
    category: 'health',
    difficulty: 'easy',
    estimatedTotalTime: 30,
    description: 'Take a 20-minute walk for health and mental clarity',
    tips: ['Wear comfortable shoes', 'Choose a safe route', 'Bring water if hot', 'Listen to music or podcast'],
    steps: [
      { id: '1', description: 'Put on walking shoes', estimatedMinutes: 2, optional: false },
      { id: '2', description: 'Get phone (for safety and music)', estimatedMinutes: 1, optional: false },
      { id: '3', description: 'Leave house and lock door', estimatedMinutes: 1, optional: false },
      { id: '4', description: 'Walk at comfortable pace', estimatedMinutes: 20, optional: false },
      { id: '5', description: 'Return home', estimatedMinutes: 3, optional: false },
      { id: '6', description: 'Unlock door and enter', estimatedMinutes: 1, optional: false },
      { id: '7', description: 'Store shoes', estimatedMinutes: 1, optional: false },
    ],
    accessibilityNotes: 'Always carry ID and emergency contact. Choose familiar routes initially.',
  },

  {
    id: 'health_grocery_shop',
    title: 'Grocery Shopping',
    category: 'health',
    difficulty: 'medium',
    estimatedTotalTime: 60,
    description: 'Go grocery shopping for weekly needs',
    tips: ['Always bring a list', 'Shop at less busy times', 'Check fridge before going'],
    steps: [
      { id: '1', description: 'Check fridge and pantry for what\'s needed', estimatedMinutes: 10, optional: false },
      { id: '2', description: 'Make shopping list (or use existing list)', estimatedMinutes: 5, optional: false },
      { id: '3', description: 'Get reusable bags and keys/wallet', estimatedMinutes: 3, optional: false },
      { id: '4', description: 'Drive or walk to store', estimatedMinutes: 10, optional: false },
      { id: '5', description: 'Go through store following list', estimatedMinutes: 20, optional: false },
      { id: '6', description: 'Check out and pay', estimatedMinutes: 7, optional: false },
      { id: '7', description: 'Load bags and return home', estimatedMinutes: 10, optional: false },
      { id: '8', description: 'Unpack groceries into kitchen', estimatedMinutes: 10, optional: false },
      { id: '9', description: 'Store perishables in fridge/freezer', estimatedMinutes: 10, optional: false },
      { id: '10', description: 'Store non-perishables in pantry', estimatedMinutes: 5, optional: false },
    ],
    accessibilityNotes: 'Take a photo of list or use app. Bring someone to help if mobility is limited.',
  },

  // ==================== WORK & STUDY ====================

  {
    id: 'work_morning_commute',
    title: 'Morning Commute',
    category: 'work',
    difficulty: 'easy',
    estimatedTotalTime: 40,
    description: 'Commute to work or school',
    tips: ['Leave 5-10 extra minutes early', 'Check traffic or transit before leaving', 'Have a backup plan'],
    steps: [
      { id: '1', description: 'Gather work/school bag', estimatedMinutes: 2, optional: false },
      { id: '2', description: 'Get keys, wallet, phone, headphones', estimatedMinutes: 2, optional: false },
      { id: '3', description: 'Put on coat/shoes as needed', estimatedMinutes: 2, optional: false },
      { id: '4', description: 'Check weather for umbrella/better jacket', estimatedMinutes: 1, optional: true },
      { id: '5', description: 'Lock door and leave house', estimatedMinutes: 1, optional: false },
      { id: '6', description: 'Commute to destination (driving/transit/walking)', estimatedMinutes: 25, optional: false },
      { id: '7', description: 'Arrive at destination', estimatedMinutes: 2, optional: false },
      { id: '8', description: 'Enter building and go to work area', estimatedMinutes: 5, optional: false },
    ],
    accessibilityNotes: 'Set phone alarm 5 min before you need to leave. Keep spare key accessible.',
  },

  {
    id: 'work_study_session',
    title: 'Study Session',
    category: 'work',
    difficulty: 'medium',
    estimatedTotalTime: 60,
    description: 'Focused study or work block',
    tips: ['Remove distractions - put phone away', 'Set timer for 25 min work, 5 min break (Pomodoro)', 'Have water nearby', 'Set specific goal for session'],
    steps: [
      { id: '1', description: 'Choose what to study/work on', estimatedMinutes: 2, optional: false },
      { id: '2', description: 'Clear workspace of distractions', estimatedMinutes: 3, optional: false },
      { id: '3', description: 'Get materials ready (books, notes, computer)', estimatedMinutes: 5, optional: false },
      { id: '4', description: 'Focus block 1: Study/work for 25 minutes', estimatedMinutes: 25, optional: false },
      { id: '5', description: 'Break: Stretch, move, get water', estimatedMinutes: 5, optional: false },
      { id: '6', description: 'Focus block 2: Continue work for 25 minutes', estimatedMinutes: 25, optional: false },
      { id: '7', description: 'Clean up materials and workspace', estimatedMinutes: 5, optional: true },
      { id: '8', description: 'Note what was accomplished', estimatedMinutes: 5, optional: true },
    ],
    accessibilityNotes: 'Use fidget or focus tools if helpful. Take longer breaks as needed.',
  },

  // ==================== SOCIAL & COMMUNICATION ====================

  {
    id: 'social_call_family',
    title: 'Call Family Member',
    category: 'social',
    difficulty: 'easy',
    estimatedTotalTime: 30,
    description: 'Make a call to stay connected with family',
    tips: ['Have topics in mind to discuss', 'Choose a quiet time', 'Set reminder on phone'],
    steps: [
      { id: '1', description: 'Remember: who to call, what to discuss', estimatedMinutes: 2, optional: false },
      { id: '2', description: 'Find phone and ensure charged', estimatedMinutes: 1, optional: false },
      { id: '3', description: 'Find a quiet place with good reception', estimatedMinutes: 2, optional: false },
      { id: '4', description: 'Dial and make the call', estimatedMinutes: 1, optional: false },
      { id: '5', description: 'Chat - listen and share', estimatedMinutes: 20, optional: false },
      { id: '6', description: 'Say goodbye and end call', estimatedMinutes: 2, optional: false },
      { id: '7', description: 'Note next time to call if planned', estimatedMinutes: 1, optional: true },
    ],
    accessibilityNotes: 'Consider video calls for better connection for dementia patients.',
  },

  {
    id: 'social_prepare_for_guests',
    title: 'Prepare for Guests',
    category: 'social',
    difficulty: 'medium',
    estimatedTotalTime: 45,
    description: 'Get house ready for visitors',
    tips: ['Focus on main areas (living room, bathroom, kitchen)', 'Don\'t obsess over perfect cleanliness', 'Prepare refreshments'],
    steps: [
      { id: '1', description: 'Pick up clutter from living room', estimatedMinutes: 10, optional: false },
      { id: '2', description: 'Vacuum or sweep main floors', estimatedMinutes: 10, optional: false },
      { id: '3', description: 'Clean bathroom (sink, toilet, mirror)', estimatedMinutes: 10, optional: false },
      { id: '4', description: 'Wipe kitchen counters and table', estimatedMinutes: 5, optional: false },
      { id: '5', description: 'Prepare snacks or drinks if you want', estimatedMinutes: 5, optional: true },
      { id: '6', description: 'Open windows for fresh air', estimatedMinutes: 2, optional: true },
      { id: '7', description: 'Quick check: is home ready?', estimatedMinutes: 2, optional: false },
    ],
    accessibilityNotes: 'Keep it simple - focus on comfort, not perfection. Accept help if offered.',
  },

  {
    id: 'social_pay_bills',
    title: 'Pay Bills',
    category: 'social',
    difficulty: 'medium',
    estimatedTotalTime: 30,
    description: 'Review and pay monthly bills',
    tips: ['Set up autopay when possible', 'Set calendar reminders', 'Keep bills in one place'],
    steps: [
      { id: '1', description: 'Gather all bills from mailbox or email', estimatedMinutes: 5, optional: false },
      { id: '2', description: 'Review each bill for correct charges', estimatedMinutes: 5, optional: false },
      { id: '3', description: 'Log into online banking or bill payment sites', estimatedMinutes: 3, optional: false },
      { id: '4', description: 'Pay bills that are due now', estimatedMinutes: 10, optional: false },
      { id: '5', description: 'Schedule payments for upcoming bills', estimatedMinutes: 5, optional: false },
      { id: '6', description: 'Confirm all payments went through', estimatedMinutes: 2, optional: false },
    ],
    accessibilityNotes: 'Consider asking family member to help set up autopay. Keep passwords in a secure, accessible place.',
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TaskTemplate['category']): TaskTemplate[] {
  return PRELOADED_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get templates by difficulty
 */
export function getTemplatesByDifficulty(difficulty: TaskTemplate['difficulty']): TaskTemplate[] {
  return PRELOADED_TEMPLATES.filter(t => t.difficulty === difficulty);
}

/**
 * Search templates by title or description
 */
export function searchTemplates(query: string): TaskTemplate[] {
  const q = query.toLowerCase();
  return PRELOADED_TEMPLATES.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.steps.some(s => s.description.toLowerCase().includes(q))
  );
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): TaskTemplate | undefined {
  return PRELOADED_TEMPLATES.find(t => t.id === id);
}