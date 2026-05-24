import re

file_path = r"c:\Jamg-Proyectos\indicadores-cofimar\frontend\src\pages\Crud.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace title text-white with text-cofimar-text
content = content.replace('className="text-3xl font-display font-bold text-white', 'className="text-3xl font-display font-bold text-cofimar-text')
content = content.replace('text-sm font-medium text-white">{successMsg}', 'text-sm font-medium text-cofimar-text">{successMsg}')

# 2. Replace hover:text-white inside tabs with hover:text-cofimar-text
content = content.replace('hover:text-white', 'hover:text-cofimar-text')

# 3. Replace thead background and text colors
content = content.replace('className="bg-slate-800/40 text-slate-400', 'className="bg-slate-100/70 dark:bg-slate-900/50 text-slate-500 dark:text-slate-450')

# 4. Replace hover:bg-slate-800/10 in tr with hover:bg-slate-100/50 dark:hover:bg-slate-800/30
content = content.replace('hover:bg-slate-800/10', 'hover:bg-slate-100/50 dark:hover:bg-slate-800/30')

# 5. Replace actions buttons with clean iOS-style buttons
content = content.replace(
    'className="bg-slate-800 hover:bg-slate-700 text-cofimar-primary p-1.5 rounded-lg border border-cofimar-primary/20 transition"',
    'className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-cofimar-primary p-1.5 rounded-lg border border-cofimar-border transition"'
)
content = content.replace(
    'className="bg-slate-800 hover:bg-cofimar-danger/20 text-cofimar-danger p-1.5 rounded-lg border border-cofimar-danger/20 transition"',
    'className="bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-cofimar-danger p-1.5 rounded-lg border border-cofimar-border transition"'
)

# 6. Adjust modal background overlay and content shadow
content = content.replace('bg-slate-950/70 backdrop-blur-sm', 'bg-slate-950/40 backdrop-blur-[8px]')
content = content.replace('bg-cofimar-bg/25', 'bg-cofimar-bg/10')
content = content.replace('bg-slate-950/40 border border-cofimar-border rounded-xl', 'bg-slate-100/50 dark:bg-slate-800/40 border border-cofimar-border rounded-lg')

# 7. Inputs inside modal to be rounded-lg (iOS style)
# Let's replace 'rounded-xl' inside forms with 'rounded-lg'
content = content.replace('rounded-xl px-4 py-2.5', 'rounded-lg px-4.5 py-2.5')

# Save updated content
with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Crud.tsx successfully adapted to Apple Minimalist Guidelines!")
