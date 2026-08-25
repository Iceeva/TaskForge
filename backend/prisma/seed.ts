import { PrismaClient, Priority } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TaskForge...');

  // Users
  const hash = await bcrypt.hash('password123', 12);

  const john = await prisma.user.upsert({
    where: { email: 'john@taskforge.io' },
    update: {},
    create: { email: 'john@taskforge.io', name: 'John Doe', passwordHash: hash },
  });

  const sarah = await prisma.user.upsert({
    where: { email: 'sarah@taskforge.io' },
    update: {},
    create: { email: 'sarah@taskforge.io', name: 'Sarah Miller', passwordHash: hash },
  });

  const alex = await prisma.user.upsert({
    where: { email: 'alex@taskforge.io' },
    update: {},
    create: { email: 'alex@taskforge.io', name: 'Alex Chen', passwordHash: hash },
  });

  // Workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'acme-inc' },
    update: {},
    create: { name: 'Acme Inc', slug: 'acme-inc' },
  });

  // Members
  await prisma.member.createMany({
    data: [
      { userId: john.id, workspaceId: workspace.id, role: 'OWNER' },
      { userId: sarah.id, workspaceId: workspace.id, role: 'ADMIN' },
      { userId: alex.id, workspaceId: workspace.id, role: 'MEMBER' },
    ],
    skipDuplicates: true,
  });

  // Labels
  const labels = await Promise.all([
    prisma.label.create({ data: { name: 'Bug', color: '#ef4444', workspaceId: workspace.id } }),
    prisma.label.create({ data: { name: 'Feature', color: '#3b82f6', workspaceId: workspace.id } }),
    prisma.label.create({ data: { name: 'Improvement', color: '#8b5cf6', workspaceId: workspace.id } }),
    prisma.label.create({ data: { name: 'Documentation', color: '#10b981', workspaceId: workspace.id } }),
    prisma.label.create({ data: { name: 'Design', color: '#f59e0b', workspaceId: workspace.id } }),
  ]);

  // Project
  const project = await prisma.project.create({
    data: {
      name: 'Product Launch',
      description: 'Q3 2026 product launch planning',
      icon: '🚀',
      workspaceId: workspace.id,
    },
  });

  // Columns (Kanban)
  const columns = await Promise.all([
    prisma.column.create({ data: { name: 'Backlog', color: '#6b7280', position: 0, projectId: project.id } }),
    prisma.column.create({ data: { name: 'To Do', color: '#3b82f6', position: 1, projectId: project.id, isDefault: true } }),
    prisma.column.create({ data: { name: 'In Progress', color: '#f59e0b', position: 2, projectId: project.id } }),
    prisma.column.create({ data: { name: 'In Review', color: '#8b5cf6', position: 3, projectId: project.id } }),
    prisma.column.create({ data: { name: 'Done', color: '#10b981', position: 4, projectId: project.id } }),
  ]);

  // Tasks
  const tasks = [
    { title: 'Design new landing page', priority: 'HIGH' as Priority, columnIdx: 2, assignee: sarah.id },
    { title: 'Implement user authentication', priority: 'URGENT' as Priority, columnIdx: 2, assignee: alex.id },
    { title: 'Set up CI/CD pipeline', priority: 'MEDIUM' as Priority, columnIdx: 1, assignee: john.id },
    { title: 'Write API documentation', priority: 'LOW' as Priority, columnIdx: 0, assignee: null },
    { title: 'Create onboarding flow', priority: 'HIGH' as Priority, columnIdx: 1, assignee: sarah.id },
    { title: 'Performance optimization', priority: 'MEDIUM' as Priority, columnIdx: 0, assignee: alex.id },
    { title: 'Fix mobile responsive issues', priority: 'HIGH' as Priority, columnIdx: 3, assignee: sarah.id },
    { title: 'Add dark mode support', priority: 'LOW' as Priority, columnIdx: 4, assignee: alex.id, completed: true },
    { title: 'Database migration script', priority: 'MEDIUM' as Priority, columnIdx: 4, assignee: john.id, completed: true },
    { title: 'Integrate payment gateway', priority: 'URGENT' as Priority, columnIdx: 1, assignee: john.id },
    { title: 'User feedback modal', priority: 'LOW' as Priority, columnIdx: 0, assignee: null },
    { title: 'Email notification system', priority: 'MEDIUM' as Priority, columnIdx: 2, assignee: alex.id },
  ];

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const task = await prisma.task.create({
      data: {
        title: t.title,
        description: `Description for: ${t.title}`,
        priority: t.priority,
        position: i,
        projectId: project.id,
        columnId: columns[t.columnIdx].id,
        isCompleted: t.completed || false,
        completedAt: t.completed ? new Date() : null,
        dueDate: new Date(Date.now() + (Math.random() * 14 + 1) * 86400000),
      },
    });

    if (t.assignee) {
      await prisma.taskAssignment.create({
        data: { taskId: task.id, userId: t.assignee },
      });
    }

    // Add a label to some tasks
    if (i < labels.length) {
      await prisma.taskLabel.create({
        data: { taskId: task.id, labelId: labels[i % labels.length].id },
      });
    }

    // Add a comment to first few tasks
    if (i < 4) {
      await prisma.comment.create({
        data: {
          body: `Let's make sure we handle this properly. Here are my thoughts on ${t.title}.`,
          taskId: task.id,
          authorId: [john.id, sarah.id, alex.id][i % 3],
        },
      });
    }
  }

  console.log('✅ Seed complete!');
  console.log(`   - 3 users (password: password123)`);
  console.log(`   - 1 workspace, 1 project, 5 columns`);
  console.log(`   - ${tasks.length} tasks, 5 labels`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
