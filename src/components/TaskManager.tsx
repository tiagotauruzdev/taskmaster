import React, { useState, useEffect } from 'react';
import { Check, X, Plus, Trash2, Edit2, Search, Moon, Sun } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  priority: 'baixa' | 'media' | 'alta';
  category?: string;
}

type FilterType = 'todas' | 'ativas' | 'concluidas';
type SortType = 'data' | 'alfabetica' | 'prioridade';

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<FilterType>('todas');
  const [sortType, setSortType] = useState<SortType>('data');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('media');
  const { toast } = useToast();

  // Dark Mode Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    
    // Carregar preferência de tema
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTask(e);
    } else if (e.key === 'Escape') {
      setNewTask('');
    }
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) {
      toast({
        title: "A tarefa não pode estar vazia",
        variant: "destructive",
      });
      return;
    }
    
    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      priority: newTaskPriority,
    };
    
    setTasks((prev) => [task, ...prev]);
    setNewTask('');
    setNewTaskPriority('media');
    toast({
      title: "Tarefa adicionada com sucesso",
    });
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
    toast({
      title: "Status da tarefa atualizado",
    });
  };

  const startEditing = (task: Task) => {
    setEditingTask(task.id);
    setEditText(task.text);
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) {
      toast({
        title: "A tarefa não pode estar vazia",
        variant: "destructive",
      });
      return;
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, text: editText.trim() } : task
      )
    );
    setEditingTask(null);
    toast({
      title: "Tarefa atualizada com sucesso",
    });
  };

  const confirmDelete = (id: string) => {
    setTaskToDelete(id);
  };

  const removeTask = () => {
    if (!taskToDelete) return;
    
    setTasks((prev) => prev.filter((task) => task.id !== taskToDelete));
    setTaskToDelete(null);
    toast({
      title: "Tarefa removida",
    });
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((task) => !task.completed));
    toast({
      title: "Tarefas concluídas removidas",
    });
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' anos atrás';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' meses atrás';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' dias atrás';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' horas atrás';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutos atrás';
    
    return Math.floor(seconds) + ' segundos atrás';
  };

  const sortTasks = (tasksToSort: Task[]) => {
    if (sortType === 'data') {
      return [...tasksToSort].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortType === 'alfabetica') {
      return [...tasksToSort].sort((a, b) => a.text.localeCompare(b.text));
    } else {
      const priorityValue = { alta: 3, media: 2, baixa: 1 };
      return [...tasksToSort].sort((a, b) => 
        priorityValue[b.priority] - priorityValue[a.priority]
      );
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'alta':
        return 'text-red-500';
      case 'media':
        return 'text-yellow-500';
      case 'baixa':
        return 'text-green-500';
      default:
        return '';
    }
  };

  const filteredTasks = sortTasks(
    tasks.filter((task) => {
      const matchesFilter = 
        filter === 'todas' ? true :
        filter === 'ativas' ? !task.completed :
        task.completed;
      
      const matchesSearch = 
        task.text.toLowerCase().includes(searchText.toLowerCase());
      
      return matchesFilter && matchesSearch;
    })
  );

  const activeTasks = tasks.filter((task) => !task.completed).length;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 transition-colors duration-300">
      <Card className="p-4 md:p-6 shadow-lg bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-center text-[#221F26] dark:text-white">
            Gerenciador de Tarefas
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsDarkMode(!isDarkMode);
              localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
            }}
            className="transition-colors duration-300"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
        
        <div className="space-y-4 mb-6">
          <form onSubmit={addTask} className="flex flex-col md:flex-row gap-2">
            <Input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Adicionar nova tarefa..."
              className="flex-1"
            />
            <Select
              value={newTaskPriority}
              onValueChange={(value: Task['priority']) => setNewTaskPriority(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-[#9b87f5] hover:bg-[#7E69AB] transition-colors duration-300">
              <Plus className="w-5 h-5" />
            </Button>
          </form>

          <div className="flex gap-2">
            <Input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Pesquisar tarefas..."
              className="flex-1"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-2 mb-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'todas' ? 'default' : 'outline'}
              onClick={() => setFilter('todas')}
              className={`transition-all duration-300 ${filter === 'todas' ? 'bg-[#9b87f5] hover:bg-[#7E69AB]' : ''}`}
            >
              Todas
            </Button>
            <Button
              variant={filter === 'ativas' ? 'default' : 'outline'}
              onClick={() => setFilter('ativas')}
              className={`transition-all duration-300 ${filter === 'ativas' ? 'bg-[#9b87f5] hover:bg-[#7E69AB]' : ''}`}
            >
              Ativas
            </Button>
            <Button
              variant={filter === 'concluidas' ? 'default' : 'outline'}
              onClick={() => setFilter('concluidas')}
              className={`transition-all duration-300 ${filter === 'concluidas' ? 'bg-[#9b87f5] hover:bg-[#7E69AB]' : ''}`}
            >
              Concluídas
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={sortType}
              onValueChange={(value: SortType) => setSortType(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data">Data</SelectItem>
                <SelectItem value="alfabetica">A-Z</SelectItem>
                <SelectItem value="prioridade">Prioridade</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={clearCompleted}
              className="text-red-500 hover:text-red-600 transition-colors duration-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Concluídas
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 transform hover:scale-[1.01] ${
                task.completed
                  ? 'bg-green-50 dark:bg-green-900/20 text-gray-500'
                  : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/70'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleTask(task.id)}
                  className={`h-8 w-8 transition-colors duration-300 ${
                    task.completed ? 'text-green-500' : 'text-gray-400'
                  }`}
                >
                  <Check className="h-5 w-5" />
                </Button>
                {editingTask === task.id ? (
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(task.id);
                      if (e.key === 'Escape') setEditingTask(null);
                    }}
                    className="flex-1"
                    autoFocus
                  />
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg ${task.completed ? 'line-through' : ''} dark:text-white`}>
                        {task.text}
                      </span>
                      <span className={`text-sm ${getPriorityColor(task.priority)}`}>
                        ({task.priority})
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Criada {getTimeAgo(task.createdAt)}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {editingTask === task.id ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => saveEdit(task.id)}
                    className="h-8 w-8 text-green-500 hover:text-green-600 transition-colors duration-300"
                  >
                    <Check className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEditing(task)}
                    className="h-8 w-8 text-[#9b87f5] hover:text-[#7E69AB] transition-colors duration-300"
                  >
                    <Edit2 className="h-5 w-5" />
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(task.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-600 transition-colors duration-300"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setTaskToDelete(null)}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={removeTask}>
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4 animate-fade-in">
              {searchText
                ? 'Nenhuma tarefa encontrada para esta pesquisa.'
                : filter === 'todas' 
                ? 'Nenhuma tarefa ainda. Adicione uma acima!'
                : filter === 'ativas'
                ? 'Nenhuma tarefa ativa.'
                : 'Nenhuma tarefa concluída.'}
            </p>
          )}
        </div>

        <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
          {activeTasks} {activeTasks === 1 ? 'tarefa pendente' : 'tarefas pendentes'}
        </div>
      </Card>
    </div>
  );
};

export default TaskManager;
