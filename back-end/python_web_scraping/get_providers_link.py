# python_script.py
import sys
import requests
import json
from bs4 import BeautifulSoup

def get_streaming_links_unicos(movie_id):
    # 1. Acessar a página pública do TMDb
    movie_url = f'https://www.themoviedb.org/movie/{movie_id}/watch?language=pt-BR&locale=BR'
    headers = {'User-Agent': 'Mozilla/5.0'}
    page = requests.get(movie_url, headers=headers)

    if page.status_code != 200:
        print('Erro ao acessar a página do filme.')
        return []

    soup = BeautifulSoup(page.text, 'html.parser')

    # 2. Extrair o título do filme (opcional)
    title_tag = soup.find('h2')
    title = title_tag.text.strip() if title_tag else f'Filme {movie_id}'

    # 3. Pegar todos os links dentro da <ul class="providers">
    provider_links = []
    ul = soup.find('ul', class_='providers')
    if ul:
        for li in ul.find_all('li'):
            a = li.find('a', href=True)
            if a:
                link = a['href']
                provider_name = a.get('title') or a.text.strip()
                provider_links.append((provider_name, link))

    # 4. Remover duplicatas com base no nome do provedor e mostrar os links únicos
    lista_name_movie = []
    unique_links = []
    if provider_links:
        for name, link in provider_links:
            if name not in lista_name_movie:
                unique_links.append({ 'provider_name': name, 'link': link })
                lista_name_movie.append(name)  # Adiciona o nome à lista de provedor já exibidos

    return unique_links

# Obtém o movie_id passado por argumento
movie_id = sys.argv[1]

# Chama a função de links de streaming
streaming_links = get_streaming_links_unicos(movie_id)

# Retorna os resultados como JSON
if streaming_links:
    print(json.dumps(streaming_links, ensure_ascii=False, indent=4))  # Retorna o JSON formatado
else:
    print(json.dumps({"error": "Nenhum link encontrado."}, ensure_ascii=False, indent=4))
