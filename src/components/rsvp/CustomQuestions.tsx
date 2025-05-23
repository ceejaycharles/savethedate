import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface CustomQuestionsProps {
  eventId: string;
  guestId: string;
  onComplete?: () => void;
}

export function CustomQuestions({ eventId, guestId, onComplete }: CustomQuestionsProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

      // Fetch existing responses
      if (data?.length) {
        const { data: responseData } = await supabase
          .from('question_responses')
          .select('question_id, response')
          .eq('guest_id', guestId);

        if (responseData) {
          const responseMap = responseData.reduce((acc, curr) => ({
            ...acc,
            [curr.question_id]: curr.response
          }), {});
          setResponses(responseMap);
        }
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const requiredQuestions = questions.filter(q => q.required);
      const missingRequired = requiredQuestions.some(q => !responses[q.id]);

      if (missingRequired) {
        toast.error('Please answer all required questions');
        return;
      }

      const responsesToSubmit = Object.entries(responses).map(([questionId, response]) => ({
        question_id: questionId,
        guest_id: guestId,
        response
      }));

      const { error } = await supabase
        .from('question_responses')
        .upsert(responsesToSubmit);

      if (error) throw error;

      toast.success('Responses saved successfully');
      onComplete?.();
    } catch (error) {
      console.error('Error saving responses:', error);
      toast.error('Failed to save responses');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading questions...</div>;
  }

  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Additional Questions</h3>

      {questions.map((question) => (
        <Card key={question.id} className="p-4">
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {question.type === 'text' && (
              <Input
                value={responses[question.id] || ''}
                onChange={(e) => setResponses({
                  ...responses,
                  [question.id]: e.target.value
                })}
                required={question.required}
              />
            )}

            {question.type === 'multiple_choice' && (
              <div className="space-y-2">
                {question.options.map((option: string) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={responses[question.id] === option}
                      onChange={(e) => setResponses({
                        ...responses,
                        [question.id]: e.target.value
                      })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {question.type === 'yes_no' && (
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={question.id}
                    value="yes"
                    checked={responses[question.id] === 'yes'}
                    onChange={(e) => setResponses({
                      ...responses,
                      [question.id]: e.target.value
                    })}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={question.id}
                    value="no"
                    checked={responses[question.id] === 'no'}
                    onChange={(e) => setResponses({
                      ...responses,
                      [question.id]: e.target.value
                    })}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span>No</span>
                </label>
              </div>
            )}
          </div>
        </Card>
      ))}

      <Button
        onClick={handleSubmit}
        className="w-full"
        isLoading={submitting}
      >
        Save Responses
      </Button>
    </div>
  );
}