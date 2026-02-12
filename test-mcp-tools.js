#!/usr/bin/env node

/**
 * Test all MCP tools to ensure they work correctly
 */

const API_URL = process.env.ANTHRA_API_URL || 'http://localhost:3000';
const MCP_URL = process.env.MCP_SERVER_URL || 'http://localhost:3001';

// Helper to call MCP tool
async function callMCPTool(toolName, args = {}) {
  try {
    const response = await fetch(`${MCP_URL}/sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test results
const results = {
  passed: [],
  failed: [],
};

async function testTool(name, args, description) {
  process.stdout.write(`Testing ${name}... `);
  const result = await callMCPTool(name, args);
  
  if (result.success) {
    console.log('✅ PASSED');
    results.passed.push({ name, description });
    return result.data;
  } else {
    console.log(`❌ FAILED: ${result.error}`);
    results.failed.push({ name, description, error: result.error });
    return null;
  }
}

async function main() {
  console.log('🧪 Testing all MCP tools...\n');
  console.log(`API URL: ${API_URL}`);
  console.log(`MCP URL: ${MCP_URL}\n`);

  // First, get a project to work with
  console.log('📋 Getting projects for testing...');
  const projectsRes = await fetch(`${API_URL}/api/projects`);
  const projects = await projectsRes.json();
  
  if (projects.length === 0) {
    console.log('⚠️  No projects found. Creating a test project...');
    const createProjectRes = await fetch(`${API_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Project' }),
    });
    const testProject = await createProjectRes.json();
    var projectId = testProject.id;
    var testProjectId = testProject.id;
  } else {
    var projectId = projects[0].id;
    var testProjectId = projects[0].id;
  }
  console.log(`Using project ID: ${projectId}\n`);

  // Test Projects
  console.log('=== PROJECT TOOLS ===');
  await testTool('list_projects', {}, 'List all projects');
  await testTool('get_project', { project_id: projectId }, 'Get project details');
  await testTool('create_project', { name: 'MCP Test Project' }, 'Create project');
  const createdProject = await testTool('create_project', { name: 'MCP Test Project 2' }, 'Create another project');
  if (createdProject) {
    const newProjectId = JSON.parse(createdProject.content[0].text).id || projectId;
    await testTool('update_project', { project_id: newProjectId, description: 'Updated via MCP' }, 'Update project');
  }

  // Test Tasks
  console.log('\n=== TASK TOOLS ===');
  const task = await testTool('create_task', { title: 'MCP Test Task', project_id: projectId }, 'Create task');
  let taskId = null;
  if (task) {
    try {
      const taskData = JSON.parse(task.content[0].text);
      taskId = taskData.id;
    } catch {
      // Try to extract ID from text
      const match = task.content[0].text.match(/ID: (\w+)/);
      taskId = match ? match[1] : null;
    }
  }
  
  await testTool('list_tasks', { project_id: projectId }, 'List tasks');
  await testTool('search_tasks', { query: 'test', project_id: projectId }, 'Search tasks');
  await testTool('find_task_by_title', { title: 'MCP Test Task', project_id: projectId }, 'Find task by title');
  
  if (taskId) {
    await testTool('get_task', { task_id: taskId }, 'Get task details');
    await testTool('update_task', { task_id: taskId, description: 'Updated via MCP' }, 'Update task');
    await testTool('move_task_status', { task_id: taskId, new_status: 'todo' }, 'Move task status');
  }

  // Test Dependencies
  console.log('\n=== DEPENDENCY TOOLS ===');
  const task2 = await testTool('create_task', { title: 'MCP Test Task 2', project_id: projectId }, 'Create second task');
  let task2Id = null;
  if (task2) {
    try {
      const taskData = JSON.parse(task2.content[0].text);
      task2Id = taskData.id;
    } catch {
      const match = task2.content[0].text.match(/ID: (\w+)/);
      task2Id = match ? match[1] : null;
    }
  }

  if (taskId && task2Id) {
    await testTool('add_task_dependency', { task_id: task2Id, depends_on_task_id: taskId }, 'Add task dependency');
    await testTool('get_blocked_tasks', {}, 'Get blocked tasks');
    await testTool('get_dependency_chain', { task_id: task2Id }, 'Get dependency chain');
    await testTool('remove_task_dependency', { task_id: task2Id, depends_on_task_id: taskId }, 'Remove task dependency');
  }

  // Test Subtasks
  console.log('\n=== SUBTASK TOOLS ===');
  if (taskId) {
    const subtask = await testTool('create_subtask', { parent_task_id: taskId, title: 'MCP Test Subtask' }, 'Create subtask');
    await testTool('list_subtasks', { parent_task_id: taskId }, 'List subtasks');
  }

  // Test Recurring Tasks
  console.log('\n=== RECURRING TASK TOOLS ===');
  const template = await testTool('create_recurring_template', {
    title: 'MCP Test Recurring',
    project_id: projectId,
    recurrence_pattern: 'daily',
    recurrence_config: { time: '09:00' },
  }, 'Create recurring template');
  
  let templateId = null;
  if (template) {
    try {
      const templateData = JSON.parse(template.content[0].text);
      templateId = templateData.id;
    } catch {
      const match = template.content[0].text.match(/ID: (\w+)/);
      templateId = match ? match[1] : null;
    }
  }

  await testTool('list_recurring_templates', {}, 'List recurring templates');
  if (templateId) {
    await testTool('update_recurring_template', { template_id: templateId, description: 'Updated' }, 'Update recurring template');
    await testTool('trigger_recurring_generation', { template_id: templateId }, 'Trigger recurring generation');
  }

  // Test AI Briefings
  console.log('\n=== AI BRIEFING TOOLS ===');
  await testTool('get_pending_briefings', {}, 'Get pending briefings');
  // acknowledge_briefing requires a task_id, skip for now

  // Test Analytics
  console.log('\n=== ANALYTICS TOOLS ===');
  await testTool('get_task_summary', { project_id: projectId }, 'Get task summary');
  await testTool('what_should_i_work_on', { project_id: projectId }, 'What should I work on');
  await testTool('analyze_project_health', { project_id: projectId }, 'Analyze project health');
  if (taskId) {
    await testTool('suggest_task_breakdown', { task_id: taskId }, 'Suggest task breakdown');
  }

  // Test Sprints
  console.log('\n=== SPRINT TOOLS ===');
  const sprint = await testTool('create_sprint', {
    name: 'MCP Test Sprint',
    project_id: projectId,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }, 'Create sprint');
  
  let sprintId = null;
  if (sprint) {
    try {
      const sprintData = JSON.parse(sprint.content[0].text);
      sprintId = sprintData.id;
    } catch {
      const match = sprint.content[0].text.match(/ID: (\w+)/);
      sprintId = match ? match[1] : null;
    }
  }

  await testTool('list_sprints', { project_id: projectId }, 'List sprints');
  if (sprintId) {
    await testTool('get_sprint', { sprint_id: sprintId }, 'Get sprint details');
    await testTool('update_sprint', { sprint_id: sprintId, description: 'Updated via MCP' }, 'Update sprint');
    await testTool('get_sprint_velocity', { sprint_id: sprintId }, 'Get sprint velocity');
    
    if (taskId) {
      await testTool('add_task_to_sprint', { sprint_id: sprintId, task_id: taskId, story_points: 5 }, 'Add task to sprint');
      await testTool('update_sprint_task', { sprint_id: sprintId, task_id: taskId, story_points: 8 }, 'Update sprint task');
      await testTool('remove_task_from_sprint', { sprint_id: sprintId, task_id: taskId }, 'Remove task from sprint');
    }
  }

  // Test Bulk Operations
  console.log('\n=== BULK OPERATIONS ===');
  if (taskId && task2Id) {
    await testTool('bulk_update_tasks', {
      task_ids: [taskId, task2Id],
      updates: { priority: 'high' },
    }, 'Bulk update tasks');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ FAILED TOOLS:');
    results.failed.forEach(({ name, error }) => {
      console.log(`  - ${name}: ${error}`);
    });
  }
  
  console.log('\n✅ PASSED TOOLS:');
  results.passed.forEach(({ name }) => {
    console.log(`  - ${name}`);
  });
}

main().catch(console.error);
