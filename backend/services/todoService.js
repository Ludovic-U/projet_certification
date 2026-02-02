const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create a new todo
 * @param {Object} data - Todo data
 * @param {string} data.text - Todo text
 * @param {number} data.projectId - Project ID
 * @param {number} [data.assignedTo] - User ID assigned to the todo
 * @param {string} [data.deadline] - Deadline date
 * @returns {Promise<Object>} Created todo
 */
module.exports.createTodo = async (data) => {
  try {
    const validProjectId = Number(data.projectId);
    if (!Number.isInteger(validProjectId) || validProjectId <= 0) {
      throw new Error("Invalid projectId");
    }

    const todoData = {
      text: data.text,
      projectId: validProjectId,
      completed: false,
    };

    if (data.assignedTo) {
      const validUserId = Number(data.assignedTo);
      if (Number.isInteger(validUserId) && validUserId > 0) {
        todoData.assignedTo = validUserId;
      }
    }

    if (data.deadline) {
      todoData.deadline = new Date(data.deadline);
    }

    const newTodo = await prisma.todo.create({
      data: todoData,
      include: {
        assignedUser: {
          select: {
            userId: true,
            firstname: true,
            lastname: true,
          },
        },
      },
    });

    return newTodo;
  } catch (error) {
    console.error("Error creating todo:", error);
    throw error;
  }
};

/**
 * Get all todos for a project
 * @param {number} projectId - Project ID
 * @returns {Promise<Array>} List of todos
 */
module.exports.getTodosByProjectId = async (projectId) => {
  try {
    const validProjectId = Number(projectId);
    if (!Number.isInteger(validProjectId) || validProjectId <= 0) {
      throw new Error("Invalid projectId");
    }

    const todos = await prisma.todo.findMany({
      where: { projectId: validProjectId },
      include: {
        assignedUser: {
          select: {
            userId: true,
            firstname: true,
            lastname: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the response to match frontend expectations
    return todos.map(todo => ({
      id: todo.todoId,
      text: todo.text,
      completed: todo.completed,
      assignedTo: todo.assignedTo,
      assignedToName: todo.assignedUser 
        ? `${todo.assignedUser.firstname} ${todo.assignedUser.lastname}` 
        : undefined,
      deadline: todo.deadline?.toISOString(),
      createdAt: todo.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching todos:", error);
    throw error;
  }
};

/**
 * Update a todo
 * @param {number} todoId - Todo ID
 * @param {Object} data - Updated todo data
 * @returns {Promise<Object>} Updated todo
 */
module.exports.updateTodo = async (todoId, data) => {
  try {
    const validTodoId = Number(todoId);
    if (!Number.isInteger(validTodoId) || validTodoId <= 0) {
      throw new Error("Invalid todoId");
    }

    const updateData = {};

    if (data.text !== undefined) updateData.text = data.text;
    if (data.completed !== undefined) updateData.completed = data.completed;
    
    if (data.assignedTo !== undefined) {
      if (data.assignedTo === null) {
        updateData.assignedTo = null;
      } else {
        const validUserId = Number(data.assignedTo);
        if (Number.isInteger(validUserId) && validUserId > 0) {
          updateData.assignedTo = validUserId;
        }
      }
    }

    if (data.deadline !== undefined) {
      updateData.deadline = data.deadline ? new Date(data.deadline) : null;
    }

    const updatedTodo = await prisma.todo.update({
      where: { todoId: validTodoId },
      data: updateData,
      include: {
        assignedUser: {
          select: {
            userId: true,
            firstname: true,
            lastname: true,
          },
        },
      },
    });

    return {
      id: updatedTodo.todoId,
      text: updatedTodo.text,
      completed: updatedTodo.completed,
      assignedTo: updatedTodo.assignedTo,
      assignedToName: updatedTodo.assignedUser 
        ? `${updatedTodo.assignedUser.firstname} ${updatedTodo.assignedUser.lastname}` 
        : undefined,
      deadline: updatedTodo.deadline?.toISOString(),
    };
  } catch (error) {
    console.error("Error updating todo:", error);
    if (error.code === "P2025") {
      throw new Error("Todo not found");
    }
    throw error;
  }
};

/**
 * Delete a todo
 * @param {number} todoId - Todo ID
 * @returns {Promise<Object>} Deleted todo
 */
module.exports.deleteTodo = async (todoId) => {
  try {
    const validTodoId = Number(todoId);
    if (!Number.isInteger(validTodoId) || validTodoId <= 0) {
      throw new Error("Invalid todoId");
    }

    const deletedTodo = await prisma.todo.delete({
      where: { todoId: validTodoId },
    });

    return deletedTodo;
  } catch (error) {
    console.error("Error deleting todo:", error);
    if (error.code === "P2025") {
      throw new Error("Todo not found");
    }
    throw error;
  }
};
