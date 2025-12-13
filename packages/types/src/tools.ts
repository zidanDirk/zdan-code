export interface Todo {
	id: string;
	content: string;
	status: 'pending' | 'in_progress' | 'completed';
}

// 新增下面的接口
export interface TodoWriteParameters {
	tool_name: 'TodoWrite';
	todos: Omit<Todo, 'id'>[]; // AI 不需要提供 id，我们将在后端生成它
}
export interface ReadParameters {
	tool_name: 'Read';
	file_path: string;
}

export interface EditParameters {
	tool_name: 'Edit';
	file_path: string;
	old_string: string;
	new_string: string;
}

export type ToolParameters = TodoWriteParameters | ReadParameters | EditParameters;
