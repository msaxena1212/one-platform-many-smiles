import urllib.request
import json

service_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDE3NTg4MiwiZXhwIjoyMDk5NzUxODgyfQ.mRwmoyI1ZIKX96qT5dwrno4RATxj01qgSVZ10YigG28'
headers = {
    'apikey': service_key,
    'Authorization': f'Bearer {service_key}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

# 1. Load Excel JSON
with open('e:/Port/Property Management System/Documents/employees_clean.json', 'r', encoding='utf-8') as f:
    excel_data = json.load(f)

# Extract unique departments and designations
unique_depts = sorted(list(set(emp.get('Department', '').strip() for emp in excel_data if emp.get('Department', '').strip())))
unique_desigs = sorted(list(set(emp.get('Designation', '').strip() for emp in excel_data if emp.get('Designation', '').strip())))

print('Unique depts:', unique_depts)
print('Unique desigs:', unique_desigs)

# 2. Check existing departments or insert
req = urllib.request.Request('https://rnebpqnzignwjeukgztz.supabase.co/rest/v1/departments?select=*', headers=headers)
with urllib.request.urlopen(req) as res:
    existing_depts = json.loads(res.read().decode('utf-8'))

dept_map = {d['name'].strip().lower(): d['id'] for d in existing_depts}
for dname in unique_depts:
    if dname.lower() not in dept_map:
        req = urllib.request.Request(
            'https://rnebpqnzignwjeukgztz.supabase.co/rest/v1/departments',
            data=json.dumps({'name': dname, 'description': f'{dname} Department'}).encode('utf-8'),
            headers=headers
        )
        try:
            with urllib.request.urlopen(req) as res:
                res_data = json.loads(res.read().decode('utf-8'))
                dept_map[dname.lower()] = res_data[0]['id']
                print(f'Inserted department: {dname} -> {res_data[0]["id"]}')
        except Exception as e:
            print(f'Error inserting dept {dname}:', e)

# 3. Check existing designations or insert
req = urllib.request.Request('https://rnebpqnzignwjeukgztz.supabase.co/rest/v1/designations?select=*', headers=headers)
with urllib.request.urlopen(req) as res:
    existing_desigs = json.loads(res.read().decode('utf-8'))

desig_map = {d['title'].strip().lower(): d['id'] for d in existing_desigs}
for dtitle in unique_desigs:
    if dtitle.lower() not in desig_map:
        req = urllib.request.Request(
            'https://rnebpqnzignwjeukgztz.supabase.co/rest/v1/designations',
            data=json.dumps({'title': dtitle}).encode('utf-8'),
            headers=headers
        )
        try:
            with urllib.request.urlopen(req) as res:
                res_data = json.loads(res.read().decode('utf-8'))
                desig_map[dtitle.lower()] = res_data[0]['id']
                print(f'Inserted designation: {dtitle} -> {res_data[0]["id"]}')
        except Exception as e:
            print(f'Error inserting desig {dtitle}:', e)

# 4. Fetch all employees from DB
req = urllib.request.Request('https://rnebpqnzignwjeukgztz.supabase.co/rest/v1/employees?select=id,first_name,last_name,employee_id_code', headers=headers)
with urllib.request.urlopen(req) as res:
    db_emps = json.loads(res.read().decode('utf-8'))

print(f'Found {len(db_emps)} employees in DB.')

updated = 0
for db_emp in db_emps:
    full_name_db = f"{db_emp.get('first_name', '')} {db_emp.get('last_name', '')}".strip().lower()
    
    # Match with excel employee
    match = None
    for ex in excel_data:
        ex_name = ex.get('Employee Name', '').strip().lower()
        if ex_name == full_name_db or ex_name.startswith(db_emp.get('first_name', '').strip().lower()):
            match = ex
            break
            
    if match:
        dept_name = match.get('Department', '').strip().lower()
        desig_title = match.get('Designation', '').strip().lower()
        
        dept_id = dept_map.get(dept_name)
        desig_id = desig_map.get(desig_title)
        
        update_data = {}
        if dept_id:
            update_data['department_id'] = dept_id
        if desig_id:
            update_data['designation_id'] = desig_id
            
        if update_data:
            emp_id = db_emp['id']
            up_req = urllib.request.Request(
                f'https://rnebpqnzignwjeukgztz.supabase.co/rest/v1/employees?id=eq.{emp_id}',
                data=json.dumps(update_data).encode('utf-8'),
                headers={**headers, 'Prefer': 'return=minimal'},
                method='PATCH'
            )
            with urllib.request.urlopen(up_req) as up_res:
                updated += 1
                print(f"Updated {full_name_db} -> Dept: {match.get('Department')}, Desig: {match.get('Designation')}")

print(f'Done! Successfully updated {updated} employees with Dept & Designation IDs.')
