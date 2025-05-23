import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Plus, Edit2, Trash2, Save, X, GripVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface CustomQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiple_choice' | 'yes_no';
  options: string[];
  required: boolean;
  order_index: number;
}

export default function CustomQuestionsPage() {
  const { eventId } = useParams();
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    type: 'text' as const,
    options: [''],
    required: false
  });

  useEffect(() => {
    fetchQuestions();
  }, [eventId]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_questions')
        .select('*')
        .eq('event_id', eventId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('custom_questions')
        .insert([
          {
            event_id: eventId,
            question: newQuestion.question,
            type: newQuestion.type,
            options: newQuestion.type === 'multiple_choice' ? newQuestion.options : null,
            required: newQuestion.required,
            order_index: questions.length
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setQuestions([...questions, data]);
      setNewQuestion({
        question: '',
        type: 'text',
        options: [''],
        required: false
      });
      toast.success('Question added successfully');
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question');
    }
  };

  const handleUpdateQuestion = async (questionId: string) => {
    const questionToUpdate = questions.find(q => q.id === questionId);
    if (!questionToUpdate) return;

    try {
      const { error } = await supabase
        .from('custom_questions')
        .update(questionToUpdate)
        .eq('id', questionId);

      if (error) throw error;

      setEditingId(null);
      toast.success('Question updated successfully');
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('custom_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      setQuestions(questions.filter(q => q.id !== questionId));
      toast.success('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, '']
    });
  };

  const removeOption = (index: number) => {
    const newOptions = newQuestion.options.filter((_, i) => i !== index);
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Custom Questions</h1>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Question</h2>
          <form onSubmit={handleAddQuestion} className="space-y-4">
            <Input
              label="Question"
              value={newQuestion.question}
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Type
              </label>
              <select
                className="input w-full"
                value={newQuestion.type}
                onChange={(e) => setNewQuestion({
                  ...newQuestion,
                  type: e.target.value as 'text' | 'multiple_choice' | 'yes_no'
                })}
              >
                <option value="text">Text</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="yes_no">Yes/No</option>
              </select>
            </div>

            {newQuestion.type === 'multiple_choice' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Options
                </label>
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                >
                  Add Option
                </Button>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="required"
                checked={newQuestion.required}
                onChange={(e) => setNewQuestion({
                  ...newQuestion,
                  required: e.target.checked
                })}
                className="h-4 w-4 text-primary-600 rounded border-gray-300"
              />
              <label htmlFor="required" className="text-sm font-medium text-gray-700">
                Required
              </label>
            </div>

            <Button type="submit" className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No Questions Yet</h2>
            <p className="text-gray-600 mb-4">
              Add custom questions to gather additional information from your guests.
            </p>
          </Card>
        ) : (
          questions.map((question, index) => (
            <Card key={question.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {question.question}
                      {question.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Type: {question.type}
                    </p>
                    {question.type === 'multiple_choice' && (
                      <div className="mt-2 space-y-1">
                        {question.options.map((option, i) => (
                          <div key={i} className="text-sm text-gray-600">
                            • {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(question.id)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}