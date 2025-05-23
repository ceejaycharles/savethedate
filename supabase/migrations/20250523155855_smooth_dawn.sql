/*
  # Add functions for gift management

  1. New Functions
    - increment_gift_purchased_quantity: Safely increment the purchased quantity of a gift item
*/

CREATE OR REPLACE FUNCTION increment_gift_purchased_quantity(gift_item_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE gift_items
  SET purchased_quantity = LEAST(quantity, purchased_quantity + 1)
  WHERE id = gift_item_id;
END;
$$;