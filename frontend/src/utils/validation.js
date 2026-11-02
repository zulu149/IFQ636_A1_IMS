import { todayInputValue } from './format';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MIN_PASSWORD_LENGTH = 8;
const MAX_DESCRIPTION_LENGTH = 200;
const MAX_NOTES_LENGTH = 1000;

export const MAX_LINE_ITEMS = 50;

export const hasErrors = (errors) => Object.keys(errors).length > 0;

export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!email.trim()) errors.email = 'Email is required';
  if (!password) errors.password = 'Password is required';
  return errors;
};

export const validateRegister = ({ name, email, password, confirmPassword }) => {
  const errors = {};
  if (!name.trim()) errors.name = 'Name is required';
  else if (name.trim().length > MAX_NAME_LENGTH) errors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer`;
  if (!email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_REGEX.test(email.trim())) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  else if (password.length < MIN_PASSWORD_LENGTH) errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match';
  return errors;
};

export const validateInvoice = ({ customer, dueDate, taxRate, notes, items }) => {
  const errors = {};
  if (!customer) errors.customer = 'Customer is required';
  if (!dueDate) errors.dueDate = 'Due date is required';
  else if (dueDate < todayInputValue()) errors.dueDate = 'Due date cannot be in the past';
  const rate = Number(taxRate);
  if (taxRate === '' || !(rate >= 0 && rate <= 100)) errors.taxRate = 'Tax rate must be between 0 and 100';
  if (notes.length > MAX_NOTES_LENGTH) errors.notes = `Notes must be ${MAX_NOTES_LENGTH} characters or fewer`;

  if (items.length === 0) errors.items = 'Add at least one line item';
  else if (items.length > MAX_LINE_ITEMS) errors.items = `An invoice can have at most ${MAX_LINE_ITEMS} line items`;
  items.forEach((item, index) => {
    const prefix = `items.${index}`;
    const description = item.description.trim();
    if (!description) errors[`${prefix}.description`] = 'Description is required';
    else if (description.length > MAX_DESCRIPTION_LENGTH) errors[`${prefix}.description`] = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`;
    if (!(Number(item.quantity) > 0)) errors[`${prefix}.quantity`] = 'Quantity must be greater than 0';
    if (item.unitPrice === '' || !(Number(item.unitPrice) >= 0)) errors[`${prefix}.unitPrice`] = 'Unit price must be 0 or more';
  });
  return errors;
};
