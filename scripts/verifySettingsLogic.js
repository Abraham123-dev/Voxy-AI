function calculateCompletion(data) {
  const SETTINGS_FIELDS = [
    'name',
    'description',
    'category',
    'business_hours',
    'assistant_tone'
  ];

  let completedCount = 0;
  
  if (data.name && data.name.trim().length > 0) completedCount++;
  if (data.description && data.description.trim().length > 0) completedCount++;
  if (data.category && data.category.trim().length > 0) completedCount++;
  
  if (data.business_hours && Object.keys(data.business_hours).length > 0) {
    completedCount++;
  }
  
  if (data.assistant_tone && data.assistant_tone.trim().length > 0) completedCount++;

  const percentage = Math.round((completedCount / SETTINGS_FIELDS.length) * 100);
  return percentage;
}

const testCases = [
  {
    name: "Empty data",
    data: {},
    expected: 0
  },
  {
    name: "Partial data (3/5)",
    data: {
      name: "Voxy",
      description: "AI assistant",
      category: "Other"
    },
    expected: 60
  },
  {
    name: "Almost complete (4/5)",
    data: {
      name: "Voxy",
      description: "AI assistant",
      category: "Other",
      business_hours: { Monday: { open: "09:00", close: "18:00" } }
    },
    expected: 80
  },
  {
    name: "Fully complete (5/5)",
    data: {
      name: "Voxy",
      description: "AI assistant",
      category: "Other",
      business_hours: { Monday: { open: "09:00", close: "18:00" } },
      assistant_tone: "Professional"
    },
    expected: 100
  }
];

testCases.forEach(tc => {
  const result = calculateCompletion(tc.data);
  console.log(`Test: ${tc.name}`);
  console.log(`Result: ${result}% (Expected: ${tc.expected}%)`);
  console.log(`Status: ${result === tc.expected ? "PASS" : "FAIL"}`);
  console.log('---');
});
