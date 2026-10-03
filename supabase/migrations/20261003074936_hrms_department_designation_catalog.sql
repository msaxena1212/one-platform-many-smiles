INSERT INTO public.departments (name)
VALUES
	('Management'),
	('Finance & Accounts'),
	('HR & Administration'),
	('Sales & Marketing'),
	('Operations'),
	('Procurement'),
	('Information Technology'),
	('Customer Service'),
	('Maintenance / Technical'),
	('Warehouse')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.designations (title)
VALUES
	('Director'),
	('General Manager'),
	('Manager'),
	('Assistant Manager'),
	('Accountant'),
	('HR Executive'),
	('Admin Executive'),
	('Sales Executive'),
	('Operations Executive'),
	('Procurement Executive'),
	('IT Support'),
	('Customer Service Executive'),
	('Supervisor'),
	('Technician'),
	('Driver'),
	('Office Assistant')
ON CONFLICT (title) DO NOTHING;
