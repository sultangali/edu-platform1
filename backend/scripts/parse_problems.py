#!/usr/bin/env python3
"""Parse the two Word docs (90 problems + answers) into a clean JS data module.

Sources (Kazakh, 8th grade "Quadratic function"):
  - 90_problemalyk_esepter_tapsyrmalar_grafik_saykestendiru.docx  -> tasks
  - 90_problemalyk_esepter_zhauaptar.docx                         -> full answers

Output: backend/src/data/problems90.js

Run from repo root:  python3 backend/scripts/parse_problems.py
"""
import zipfile, re, html, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TASKS_DOC = os.path.join(ROOT, '90_problemalyk_esepter_tapsyrmalar_grafik_saykestendiru.docx')
ANSW_DOC = os.path.join(ROOT, '90_problemalyk_esepter_zhauaptar.docx')
OUT = os.path.join(ROOT, 'backend', 'src', 'data', 'problems90.js')


def paragraphs(path):
    """Yield visible paragraph text, dropping table/markup-only lines."""
    xml = zipfile.ZipFile(path).read('word/document.xml').decode('utf-8', 'replace')
    xml = xml.replace('<w:tab/>', '\t')
    out = []
    for p in re.split(r'</w:p>', xml):
        texts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', p, re.S)
        line = html.unescape(''.join(texts)).strip()
        if not line:
            continue
        if '<w:' in line:        # leftover table markup -> skip
            continue
        out.append(line)
    return out


# ---- parse answers: "N-есеп. <full answer>" ----
answers = {}
for line in paragraphs(ANSW_DOC):
    m = re.match(r'^(\d+)-есеп\.\s*(.*)$', line)
    if m:
        answers[int(m.group(1))] = m.group(2).strip()

# ---- parse tasks: sections + problems ----
problems = {}      # id -> dict
sections = {}      # section_no -> theme title
cur_section = 0
cur_id = None
for line in paragraphs(TASKS_DOC):
    ms = re.match(r'^(\d+)-бөлім\.\s*(.*)$', line)
    if ms:
        cur_section = int(ms.group(1))
        sections[cur_section] = ms.group(2).strip()
        cur_id = None
        continue
    mp = re.match(r'^(\d+)-есеп\.\s*(.*)$', line)
    if mp:
        cur_id = int(mp.group(1))
        problems[cur_id] = {
            'id': cur_id,
            'section': cur_section,
            'subtype': mp.group(2).strip(),
            'question': '',
        }
        continue
    if cur_id is not None:
        # append question body (some problems have option lines too)
        problems[cur_id]['question'] = (problems[cur_id]['question'] + ' ' + line).strip()


# ---- derive function coefficients a,b,c from "F(..)=...." when present ----
def parse_quadratic(q):
    """Return [a,b,c] for an expression like -t² + 8t + 1 or -x²+16x. None if absent."""
    m = re.search(r'F\([a-zA-Z]\)\s*=\s*([^.;]+)', q)
    if not m:
        return None
    expr = m.group(1)
    expr = expr.replace('−', '-').replace('–', '-').replace(' ', '')
    var = 't' if 't' in expr else 'x'
    num = r'(?:\d+(?:[,\.]\d+)?)'        # 5, 0,5, 0.25 ...

    def tonum(s):
        s = s.replace(',', '.')
        if s in ('', '+'): return 1.0
        if s == '-': return -1.0
        return float(s)

    a = b = c = 0
    # a: coeff of x²
    ma = re.search(r'([+-]?' + num + r'?)' + var + r'²', expr)
    if not ma:
        return None
    a = tonum(ma.group(1))
    expr2 = expr[:ma.start()] + expr[ma.end():]
    # b: coeff of x (not x²)
    mb = re.search(r'([+-]?' + num + r'?)' + var + r'(?!²)', expr2)
    if mb:
        b = tonum(mb.group(1))
        expr2 = expr2[:mb.start()] + expr2[mb.end():]
    # c: constant
    mc = re.search(r'([+-]' + num + r')(?![a-zA-Z²])', expr2)
    if mc:
        c = float(mc.group(1).replace(',', '.'))

    def trim(x):
        return int(x) if float(x).is_integer() else round(x, 4)
    return [trim(a), trim(b), trim(c)]


# ---- derive a short canonical answerKey per problem from its full answer ----
def short_key(pid, ans):
    typ = (pid - 1) % 9 + 1          # 1..9 within section
    if typ == 1:    # optimal value: "...Тиімді жағдай: t=3, себебі..."
        m = re.search(r'(?:Тиімді жағдай|жағдай)\s*:\s*([a-zA-Z]=-?\d+(?:[,\.]\d+)?)', ans)
        if m: return m.group(1).replace(',', '.').rstrip('.')
    if typ == 2:    # zeros: "...шешімі: t=8,12, t=-0,12. Бұл..."
        m = re.search(r'шешімі:\s*([^.]+)\.', ans)
        if m: return m.group(1).strip().rstrip('.')
    if typ == 3:    # vertex: "Төбесі T(4; 17)..."
        m = re.search(r'T\(([^)]+)\)', ans)
        if m: return '(' + m.group(1).strip() + ')'
    if typ == 4:    # transform vertex: "...төбесі (2; 2); симметрия осі x=2..."
        m = re.search(r'төбесі\s*\(([^)]+)\)', ans)
        if m: return '(' + m.group(1).strip() + ')'
    if typ == 5:    # table -> max F value (the vertex y)
        vals = re.findall(r'F\([^)]*\)\s*=\s*(-?\d+(?:,\d+)?)', ans)
        if vals:
            nums = [float(v.replace(',', '.')) for v in vals]
            mx = max(nums)
            return ('%g' % mx)
    if typ == 6:    # area model: "...x=7, Smax=49."
        m = re.search(r'Smax\s*=\s*(\d+)', ans)
        if m: return m.group(1)
    if typ == 7:    # inequality interval: "...Шешімі: 2 ≤ x ≤ 6. Осы..."
        m = re.search(r'Шешімі:\s*([^.]+)\.', ans)
        if m: return m.group(1).strip()
    if typ == 8:    # matching
        m = re.search(r'(A-\d.*?D-\d)', ans)
        if m: return m.group(1).strip()
    if typ == 9:    # analysis -> vertex
        m = re.search(r'T\(([^)]+)\)', ans)
        if m: return '(' + m.group(1).strip() + ')'
    # fallback: first number(s)
    m = re.search(r'(-?\d+(?:[,\.]\d+)?)', ans)
    return m.group(1) if m else ans[:24]


# ---- assemble ----
records = []
for pid in range(1, 91):
    p = problems[pid]
    ans = answers[pid]
    rec = {
        'id': pid,
        'section': p['section'],
        'sectionTitle': sections[p['section']],
        'type': (pid - 1) % 9 + 1,
        'subtype': p['subtype'],
        'question': p['question'],
        'answerKey': short_key(pid, ans),
        'solution': ans,
    }
    coef = parse_quadratic(p['question'])
    if coef:
        rec['graph'] = coef
    # type 5 = table problem: expose the x-values (students fill F(x))
    if rec['type'] == 5:
        xs = re.findall(r'F\((-?\d+(?:,\d+)?)\)', ans)
        if xs:
            rec['tableX'] = [float(x.replace(',', '.')) if ',' in x else int(x) for x in xs]
    records.append(rec)

# section themes (ru/en lightweight translations for the 10 contexts)
SECTION_I18N = {
    1: ('Мектеп ауласындағы доп траекториясы', 'Траектория мяча во дворе школы', 'Ball trajectory in the schoolyard'),
    2: ('Жылыжайға арналған қоршау', 'Ограждение для теплицы', 'Fencing for a greenhouse'),
    3: ('Сахнадағы арка пішіні', 'Форма арки на сцене', 'Arch shape on the stage'),
    4: ('Мектеп жәрмеңкесіндегі табыс', 'Доход на школьной ярмарке', 'Revenue at the school fair'),
    5: ('Жеткізу қызметінің пайдасы', 'Прибыль службы доставки', 'Delivery service profit'),
    6: ('Субұрқақ суының көтерілуі', 'Подъём воды фонтана', 'Fountain water rise'),
    7: ('Күн панелінің жақтауы', 'Рамка солнечной панели', 'Solar panel frame'),
    8: ('Көпір аркасының моделі', 'Модель арки моста', 'Bridge arch model'),
    9: ('Мектеп логотипінің ауданы', 'Площадь школьного логотипа', 'School logo area'),
    10: ('Кітапханадағы орын саны', 'Число мест в библиотеке', 'Number of seats in the library'),
}

sections_out = [
    {'section': n, 'kk': SECTION_I18N[n][0], 'ru': SECTION_I18N[n][1], 'en': SECTION_I18N[n][2]}
    for n in range(1, 11)
]

# subtype i18n (9 repeating types)
SUBTYPE_I18N = {
    1: ('Проблемалық жағдай', 'Проблемная ситуация', 'Problem situation'),
    2: ('Нөлдерін табу', 'Поиск нулей', 'Finding zeros'),
    3: ('Графикпен зерттеу', 'Исследование по графику', 'Graph investigation'),
    4: ('Түрлендіруді түсіндіру', 'Объяснение преобразования', 'Explaining a transformation'),
    5: ('Кестемен жұмыс', 'Работа с таблицей', 'Working with a table'),
    6: ('Модель құру', 'Построение модели', 'Building a model'),
    7: ('Шешім қабылдау', 'Принятие решения', 'Decision making'),
    8: ('Сәйкестендіру', 'Сопоставление', 'Matching'),
    9: ('График бойынша талдау', 'Анализ по графику', 'Graph-based analysis'),
}
for r in records:
    t = r['type']
    r['subtypeI18n'] = {'kk': SUBTYPE_I18N[t][0], 'ru': SUBTYPE_I18N[t][1], 'en': SUBTYPE_I18N[t][2]}

# ---- emit JS module ----
def js(obj):
    return json.dumps(obj, ensure_ascii=False, indent=2)

with open(OUT, 'w', encoding='utf-8') as f:
    f.write('// AUTO-GENERATED by backend/scripts/parse_problems.py — do not edit by hand.\n')
    f.write('// Source: 90_problemalyk_esepter_tapsyrmalar_grafik_saykestendiru.docx (+ ..._zhauaptar.docx)\n')
    f.write('// 10 contexts (sections) x 9 problem types = 90 problem-based tasks (Grade 8, Quadratic function).\n')
    f.write('// Fields: answerKey & solution are TEACHER-ONLY (never sent to students).\n\n')
    f.write('export const PROBLEM_SECTIONS = ' + js(sections_out) + ';\n\n')
    f.write('export const PROBLEMS = ' + js(records) + ';\n')

print('Wrote', OUT, 'with', len(records), 'problems')
# quick sanity print
for r in records[:9]:
    print(r['id'], 'type', r['type'], '| key=', repr(r['answerKey']), '| graph=', r.get('graph'))
