import { supabase } from './supabase';

export async function createCustomQuestion(eventId: string, data: {
  question: string;
  type: 'text' | 'multiple_choice' | 'yes_no';
  options?: string[];
  required?: boolean;
  orderIndex?: number;
}) {
  const { error } = await supabase
    .from('custom_questions')
    .insert({
      event_id: eventId,
      ...data,
      options: data.options ? JSON.stringify(data.options) : null
    });

  if (error) throw error;
  return { success: true };
}

export async function submitQuestionResponse(questionId: string, guestId: string, response: string) {
  const { error } = await supabase
    .from('question_responses')
    .upsert({
      question_id: questionId,
      guest_id: guestId,
      response
    });

  if (error) throw error;
  return { success: true };
}