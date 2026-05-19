#!/bin/bash
source ~/.openclaw/.env 2>/dev/null
cd /Users/cris/.openclaw/workspace/vendoo-analytics
python3 -c """
import subprocess, os, json
api = os.environ.get('LINEAR_API_KEY')
query = '''
query Issues { issues(first: 50, filter: { team: { key: { eq: \"BTX\" } } }) { nodes { identifier title state { name } project { name } } } }
'''
result = json.loads(subprocess.run(['curl','-s','-X','POST','https://api.linear.app/graphql','-H',f'Authorization:{api}','-H','Content-Type: application/json','-d',json.dumps({'query':query})], capture_output=True, text=True).stdout)
for i in result['data']['issues']['nodes']:
    s = i['state']['name']
    print(f\"{i['identifier']}: {i['title'][:50]}... [{s}]\" if len(i['title'])>50 else f\"{i['identifier']}: {i['title']} [{s}]\")
# mark BTX-64 as started
update = '''
mutation { issueUpdate(id: \"__UUID\", input: { stateId: \"__STARTED_STATE__\" }) { success issue { identifier state { name } } } }
'''
# find BTX-64 UUID
for i in result['data']['issues']['nodes']:
    if i['identifier'] == 'BTX-64':
        print(f\"\\nBTX-64 UUID: {i.get('id','N/A')}\")
""" 2>&1
