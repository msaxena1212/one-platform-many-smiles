const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rnebpqnzignwjeukgztz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzU4ODIsImV4cCI6MjA5OTc1MTg4Mn0.maLd6Jgr8uggrfu5uZg9sjRmG0z0r7NlaMB4wIdSRTg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkEmployees() {
  const { data: emps, error } = await supabase
    .from('employees')
    .select('*, departments(*), designations(*), hrms_branches(*), hrms_companies(*)')
    .order('first_name');
  
  console.log(`Fetched ${emps?.length} employees`);
  if (emps && emps.length > 0) {
    console.log('Sample employee:', emps[0]);
    const depts = new Set();
    const desigs = new Set();
    const nats = new Set();
    const banks = new Set();
    const statuses = new Set();
    const branches = new Set();
    const companies = new Set();
    
    emps.forEach(e => {
      if (e.departments?.name) depts.add(e.departments.name);
      if (e.designations?.title) desigs.add(e.designations.title);
      if (e.nationality) nats.add(e.nationality);
      if (e.bank_name) banks.add(e.bank_name);
      if (e.employee_status) statuses.add(e.employee_status);
      if (e.hrms_branches?.name) branches.add(e.hrms_branches.name);
      if (e.hrms_companies?.name) companies.add(e.hrms_companies.name);
    });

    console.log('Unique from 38 employees:', {
      departments: Array.from(depts),
      designations: Array.from(desigs),
      nationalities: Array.from(nats),
      banks: Array.from(banks),
      statuses: Array.from(statuses),
      branches: Array.from(branches),
      companies: Array.from(companies)
    });

    // Also check what is in departments and designations tables
    const { data: allDepts } = await supabase.from('departments').select('*');
    console.log('Departments table:', allDepts);

    const { data: allDesigs } = await supabase.from('designations').select('*');
    console.log('Designations table:', allDesigs);
  }
}

checkEmployees().catch(console.error);
