#!/usr/bin/env node

/**
 * Test all MCP tools by directly calling their handlers
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import handlers
const { handleTaskTool } = await import('./mcp-server/dist/src/tools/tasks.js');
const { handleProjectTool } = await import('./mcp-server/dist/src/tools/projects.js');
const { handleAnalyticsTool } = await import('./mcp-server/dist/src/tools/analytics.js');
const { handleSprintTool } = await import('./mcp-server/dist/src/tools/sprints.js');

const API_URL = process.env.ANTHRA_API_URL || 'http://localhost:3000';

const results = {
  passed: [],
  failed: [],
};

async function testTool(handler, name, args, description) {
  process.stdout.write(`Testing ${name}... `);
  try {
    const result = await handler(name, args);
    
    if (result.isError) {
      console.log(`❌ FAILED: ${result.content[0].text}`);
      results.failed.push({ name, description, error: result.content[0].text });
      return null;
    } else {
      console.log('✅ PASSED');
      results.passed.push({ name, description });
      return result;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    results.failed.push({ name, description, error: error.message });
    return null;
  }
}

async function main() {
  console.log('🧪 Testing all MCP tools...\n');
  console.log(`API URL: ${API_URL}\n`);

  // Get a project to work with
  console.log('📋 Getting projects for testing...');
  const projectsRes = await fetch(`${API_URL}/api/projects`);
  const projects = await projectsRes.json();
  
  let projectId;
  if (projects.length === 0) {
    console.log('⚠️  No projects found. Creating a test project...');
    const createProjectRes = await fetch(`${API_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'MCP Test Project' }),
    });
    const testProject = await createProjectRes.json();
    projectId = testProject.id;
  } else {
    projectId = projects[0].id;
  }
  console.log(`Using project ID: ${projectId}\n`);

  // Test Projects
  console.log('=== PROJECT TOOLS ===');
  await testTool(handleProjectTool, 'list_projects', {}, 'List all projects');
  await testTool(handleProjectTool, 'get_project', { project_id: projectId }, 'Get project details');
  const newProject = await testTool(handleProjectTool, 'create_project', { name: 'MCP Test Project 2' }, 'Create project');
  let newProjectId = projectId;
  if (newProject) {
    const match = newProject.content[0].text.match(/ID: (\w+)/);
    if (match) newProjectId = match[1];
  }
  await testTool(handleProjectTool, 'update_project', { project_id: newProjectId, description: 'Updated via MCP' }, 'Update project');

  // Test Tasks
  console.log('\n=== TASK TOOLS ===');
  const task = await testTool(handleTaskTool, 'create_task', { title: 'MCP Test Task', project_id: projectId }, 'Create task');
  let taskId = null;
  if (task) {
    try {
      const taskData = JSON.parse(task.content[0].text);
      taskId = taskData.id;
    } catch {
      const match = task.content[0].text.match(/ID: (\w+)/);
      taskId = match ? match[1] : null;
    }
  }
  
  await testTool(handleTaskTool, 'list_tasks', { project_id: projectId }, 'List tasks');
  await testTool(handleTaskTool, 'search_tasks', { query: 'test', project_id: projectId }, 'Search tasks');
  await testTool(handleTaskTool, 'find_task_by_title', { title: 'MCP Test Task', project_id: projectId }, 'Find task by title');
  
  if (taskId) {
    await testTool(handleTaskTool, 'get_task', { task_id: taskId }, 'Get task details');
    await testTool(handleTaskTool, 'update_task', { task_id: taskId, description: 'Updated via MCP' }, 'Update task');
    await testTool(handleTaskTool, 'move_task_status', { task_id: taskId, new_status: 'todo' }, 'Move task status');
  }

  // Test Dependencies
  console.log('\n=== DEPENDENCY TOOLS ===');
  const task2 = await testTool(handleTaskTool, 'create_task', { title: 'MCP Test Task 2', project_id: projectId }, 'Create second task');
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
    await testTool(handleTaskTool, 'add_task_dependency', { task_id: task2Id, depends_on_task_id: taskId }, 'Add task dependency');
    await testTool(handleTaskTool, 'get_blocked_tasks', {}, 'Get blocked tasks');
    await testTool(handleTaskTool, 'get_dependency_chain', { task_id: task2Id }, 'Get dependency chain');
    await testTool(handleTaskTool, 'remove_task_dependency', { task_id: task2Id, depends_on_task_id: taskId }, 'Remove task dependency');
  }

  // Test Subtasks
  console.log('\n=== SUBTASK TOOLS ===');
  if (taskId) {
    await testTool(handleTaskTool, 'create_subtask', { parent_task_id: taskId, title: 'MCP Test Subtask' }, 'Create subtask');
    await testTool(handleTaskTool, 'list_subtasks', { parent_task_id: taskId }, 'List subtasks');
  }

  // Test Recurring Tasks
  console.log('\n=== RECURRING TASK TOOLS ===');
  const template = await testTool(handleTaskTool, 'create_recurring_template', {
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

  await testTool(handleTaskTool, 'list_recurring_templates', {}, 'List recurring templates');
  if (templateId) {
    await testTool(handleTaskTool, 'update_recurring_template', { template_id: templateId, description: 'Updated' }, 'Update recurring template');
    await testTool(handleTaskTool, 'trigger_recurring_generation', { template_id: templateId }, 'Trigger recurring generation');
  }

  // Test AI Briefings
  console.log('\n=== AI BRIEFING TOOLS ===');
  await testTool(handleTaskTool, 'get_pending_briefings', {}, 'Get pending briefings');

  // Test Analytics
  console.log('\n=== ANALYTICS TOOLS ===');
  await testTool(handleAnalyticsTool, 'get_task_summary', { project_id: projectId }, 'Get task summary');
  await testTool(handleAnalyticsTool, 'what_should_i_work_on', { project_id: projectId }, 'What should I work on');
  await testTool(handleAnalyticsTool, 'analyze_project_health', { project_id: projectId }, 'Analyze project health');
  if (taskId) {
    await testTool(handleAnalyticsTool, 'suggest_task_breakdown', { task_id: taskId }, 'Suggest task breakdown');
  }

  // Test Sprints
  console.log('\n=== SPRINT TOOLS ===');
  const startDate = new Date().toISOString().split('T')[0];
  const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const sprint = await testTool(handleSprintTool, 'create_sprint', {
    name: 'MCP Test Sprint',
    project_id: projectId,
    start_date: startDate,
    end_date: endDate,
  }, 'Create sprint');
  
  let sprintId = null;
  if (sprint) {
    const match = sprint.content[0].text.match(/ID: (\w+)/);
    sprintId = match ? match[1] : null;
  }

  await testTool(handleSprintTool, 'list_sprints', { project_id: projectId }, 'List sprints');
  if (sprintId) {
    await testTool(handleSprintTool, 'get_sprint', { sprint_id: sprintId }, 'Get sprint details');
    await testTool(handleSprintTool, 'update_sprint', { sprint_id: sprintId, description: 'Updated via MCP' }, 'Update sprint');
    await testTool(handleSprintTool, 'get_sprint_velocity', { sprint_id: sprintId }, 'Get sprint velocity');
    
    if (taskId) {
      await testTool(handleSprintTool, 'add_task_to_sprint', { sprint_id: sprintId, task_id: taskId, story_points: 5 }, 'Add task to sprint');
      await testTool(handleSprintTool, 'update_sprint_task', { sprint_id: sprintId, task_id: taskId, story_points: 8 }, 'Update sprint task');
      await testTool(handleSprintTool, 'remove_task_from_sprint', { sprint_id: sprintId, task_id: taskId }, 'Remove task from sprint');
    }
  }

  // Test Bulk Operations
  console.log('\n=== BULK OPERATIONS ===');
  if (taskId && task2Id) {
    await testTool(handleTaskTool, 'bulk_update_tasks', {
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
  
  console.log('\n✅ All tools tested!');
  
  process.exit(results.failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
