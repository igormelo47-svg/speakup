# Varredura de divulgação: baixa cada página pública em PRODUÇÃO, extrai links e
# recursos, e confere um a um. O que quebra aqui é clique pago indo pro lixo.
import re, urllib.request, urllib.error, json

BASE = 'https://vonai.com.br'
PAGINAS = ['/', '/aplicativo-para-aprender-ingles', '/teste-de-nivel-de-ingles', '/planos',
           '/professor-de-ingles-com-ia', '/erros-de-ingles-do-brasileiro', '/cadastro',
           '/login', '/privacidade', '/termos', '/suporte', '/excluir-conta']

def pega(url, ua='Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/126 Mobile'):
    req = urllib.request.Request(url, headers={'User-Agent': ua})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status, r.read().decode('utf-8', 'ignore'), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, '', {}
    except Exception as e:
        return 0, str(e)[:80], {}

problemas, resumo = [], {}
vistos = {}

def checa(url):
    if url in vistos: return vistos[url]
    st, _, _ = pega(url)
    vistos[url] = st
    return st

for p in PAGINAS:
    st, html, _ = pega(BASE + p)
    info = {'status': st}
    if st != 200:
        problemas.append(f'PAGINA {p} -> {st}')
        resumo[p] = info; continue
    # metas
    info['title'] = bool(re.search(r'<title>[^<]{5,}</title>', html))
    canon = re.search(r'rel="canonical" href="([^"]+)"', html)
    info['canonical'] = canon.group(1) if canon else None
    og = re.search(r'property="og:image" content="([^"]+)"', html)
    info['og_image'] = og.group(1) if og else None
    info['gtm'] = 'GTM-N5794SWR' in html
    info['noindex'] = 'noindex' in html
    # links internos e assets
    hrefs = set(re.findall(r'(?:href|src)="(/[^"#? ][^"]*)"', html))
    hrefs = {h for h in hrefs if not h.startswith('/_next/')}
    ruins = []
    for h in sorted(hrefs):
        stl = checa(BASE + h)
        if stl not in (200, 302, 307, 308):
            ruins.append(f'{h} -> {stl}')
    if ruins: problemas.append(f'{p}: ' + '; '.join(ruins))
    if og:
        og_url = og.group(1) if og.group(1).startswith('http') else BASE + og.group(1)
        sto = checa(og_url)
        if sto != 200: problemas.append(f'{p}: og:image {og_url} -> {sto}')
    ext = set(re.findall(r'(?:href|src)="(https?://[^"]+)"', html))
    ext = {e for e in ext if 'googletagmanager' not in e and 'schema.org' not in e}
    for e in sorted(ext):
        ste = checa(e)
        if ste not in (200, 301, 302, 307, 308):
            problemas.append(f'{p}: externo {e[:70]} -> {ste}')
    resumo[p] = info

print(json.dumps({'problemas': problemas, 'resumo': resumo}, ensure_ascii=False, indent=1))
