-- Create test user for direct login functionality
-- This script creates a test user with email paulilio.ferreira@gmail.com

-- Note: This is for testing purposes only and should be removed in production

INSERT INTO users (
  id,
  email,
  firstName,
  lastName,
  phone,
  cpfCnpj,
  password,
  isEmailConfirmed,
  planType,
  defaultOrganizationId,
  createdAt,
  preferences
) VALUES (
  'user_test_paulilio',
  'paulilio.ferreira@gmail.com',
  'Paulilio',
  'Ferreira',
  '(11) 99999-9999',
  '123.456.789-00',
  '123456', -- In production, this would be hashed
  true,
  'premium',
  'org_test_paulilio',
  datetime('now'),
  json('{"theme": "system", "language": "pt-BR", "notifications": {"email": true, "push": true, "sms": false}, "layout": {"sidebarCollapsed": false, "compactMode": false}}')
);

-- Create organization for test user
INSERT INTO organizations (
  id,
  name,
  ownerId,
  createdAt
) VALUES (
  'org_test_paulilio',
  'Paulilio Ferreira',
  'user_test_paulilio',
  datetime('now')
);
