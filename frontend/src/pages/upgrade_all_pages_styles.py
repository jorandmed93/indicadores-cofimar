import os

pages_dir = r"c:\Jamg-Proyectos\indicadores-cofimar\frontend\src\pages"
files = [
    "Dashboard.tsx",
    "Cycles.tsx",
    "Summary.tsx",
    "Harvests.tsx",
    "Import.tsx",
    "PondDetail.tsx"
]

for filename in files:
    filepath = os.path.join(pages_dir, filename)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    # 1. Replace title text-white with text-cofimar-text
    content = content.replace('text-white flex items-center gap', 'text-cofimar-text flex items-center gap')
    content = content.replace('text-white flex items-center justify-between', 'text-cofimar-text flex items-center justify-between')
    content = content.replace('text-3xl font-display font-bold text-white', 'text-3xl font-display font-bold text-cofimar-text')
    content = content.replace('text-2xl font-bold text-white', 'text-2xl font-bold text-cofimar-text')
    content = content.replace('text-base font-bold text-white', 'text-base font-bold text-cofimar-text')
    content = content.replace('text-lg font-bold text-white', 'text-lg font-bold text-cofimar-text')
    content = content.replace('text-sm font-bold text-white', 'text-sm font-bold text-cofimar-text')
    content = content.replace('text-xs font-bold text-white', 'text-xs font-bold text-cofimar-text')
    
    # 2. Replace tab and active headers
    content = content.replace('bg-slate-800/40 text-slate-400', 'bg-slate-100/70 dark:bg-slate-900/50 text-slate-500 dark:text-slate-450')
    content = content.replace('bg-slate-900/50 p-4 rounded-xl', 'bg-cofimar-surface p-4 rounded-lg border border-cofimar-border shadow-sm')
    content = content.replace('bg-slate-900/40 border border-cofimar-border', 'bg-cofimar-surface/70 border border-cofimar-border')
    content = content.replace('bg-slate-900/60 p-4 rounded-xl border border-cofimar-border', 'bg-cofimar-surface p-4 rounded-lg border border-cofimar-border shadow-sm')
    
    # 3. Clean up table backgrounds
    content = content.replace('hover:bg-slate-800/10', 'hover:bg-slate-100/50 dark:hover:bg-slate-800/30')
    content = content.replace('hover:bg-slate-800/20', 'hover:bg-slate-100/50 dark:hover:bg-slate-800/30')
    content = content.replace('divide-y divide-cofimar-border/25', 'divide-y divide-cofimar-border/40')
    
    # 4. Clean up cards
    content = content.replace('bg-slate-900/60 border border-cofimar-border/40', 'bg-cofimar-surface border border-cofimar-border shadow-sm')
    content = content.replace('rounded-xl', 'rounded-lg')
    content = content.replace('rounded-2xl', 'rounded-lg')
    
    # 5. Clean hover states
    content = content.replace('hover:text-white', 'hover:text-cofimar-text')
    content = content.replace('bg-slate-800 hover:bg-slate-700', 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-cofimar-border')
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print("All page components successfully refactored for Apple Minimalist Style!")
