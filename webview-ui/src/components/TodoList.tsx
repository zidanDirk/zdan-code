import type { Todo } from '@zdan-code/types';

interface TodoListProps {
	todos: Todo[];
}

const statusIcon = {
	pending: '🕒',
	in_progress: '⏳',
	completed: '✅'
};

export function TodoList({ todos }: TodoListProps) {
	if (todos.length === 0) {
		return null;
	}

	return (
		<div>
			<h3>Todo List</h3>
			<ul>
				{todos.map((todo) => (
					<li key={todo.id}>
						<span>{statusIcon[todo.status]}</span> {todo.content}
					</li>
				))}
			</ul>
		</div>
	);
}
