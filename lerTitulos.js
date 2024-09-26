const fs = require('fs');
const path = require('path');

// Diretório onde estão os arquivos HTML
const directoryPath = 'C:/Users/Admin/Desktop/Ler aquivos do FTP/getinside-backup';

// Função para extrair o título da meta tag og:title
function extractTitle(htmlContent) {
  const regex = /<meta property="og:title" content="(.*?)"/;
  const match = htmlContent.match(regex);
  return match ? match[1] : 'Título não encontrado';
}

// Função recursiva para ler diretórios e arquivos HTML
function readDirectory(directory, parentFolder = '') {
  let report = [];
  const entries = fs.readdirSync(directory);

  entries.forEach(entry => {
    const fullPath = path.join(directory, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursivamente entrar nas subpastas
      const subfolderReport = readDirectory(fullPath, path.join(parentFolder, entry));
      report = report.concat(subfolderReport);  // Adicionar os resultados das subpastas
    } else if (entry.endsWith('.html')) {
      // Ler arquivo HTML e extrair título
      const fileContent = fs.readFileSync(fullPath, 'utf-8');
      const title = extractTitle(fileContent);

      report.push({
        fileName: entry,
        folderPath: parentFolder,  // Caminho relativo (subpasta)
        fullPath: fullPath,        // Caminho completo
        title: title
      });
    }
  });

  return report;
}

// Função para contar posts por pasta
function countPostsByFolder(report) {
  const folderCount = {};
  
  report.forEach(post => {
    const folders = post.folderPath.split(path.sep);
    const originFolder = folders[0]; // Pasta de origem
    
    if (!folderCount[originFolder]) {
      folderCount[originFolder] = 0;
    }
    folderCount[originFolder]++;
  });

  return folderCount;
}

// Função para gerar o HTML estilizado com cada post, sua pasta de origem e subpasta
function generateHTMLReport() {
  const report = readDirectory(directoryPath);
  const folderCount = countPostsByFolder(report);
  const totalPosts = report.length;

  // Obter as pastas de origem (remover subpastas)
  const uniqueFolders = [...new Set(report.map(post => post.folderPath.split(path.sep)[0]))];

  // Criação da estrutura HTML
  let htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório de Posts</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 20px; }
        h1 { text-align: center; }
        h2 { font-size: 18px; color: #000000; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; border: 1px solid #ddd; }
        th { background-color: #007bff; color: white; }
        .folder-header { font-size: 18px; font-weight: bold; background-color: #f8f9fa; padding: 10px; }
        .post-title { font-size: 14px; color: #6c757d; }
        .container { max-width: 900px; margin: 0 auto; }
        .summary { background-color: #007bff; color: white; padding: 10px; margin-bottom: 20px; }
        .post-count { font-size: 16px; margin-bottom: 5px; }
        .total-count { font-weight: bold; font-size: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Relatório de Posts por Pasta e Subpasta</h1>
        
        <!-- Levantamento por pasta -->
        <div class="summary">
          <h2>Levantamento por Pasta:</h2>
  `;

  // Adicionar a contagem de posts por pasta
  Object.keys(folderCount).forEach(folder => {
    htmlContent += `<p class="post-count">Pasta: ${folder} - Quantidade de Posts: ${folderCount[folder]}</p>`;
  });

  // Levantamento total de posts
  htmlContent += `<p class="total-count">Levantamento Total: ${totalPosts} posts no total.</p>`;
  
  htmlContent += `</div>`;

  // Criar uma tabela que organiza posts, subpastas e pastas de origem
  htmlContent += `
      <table>
        <tr>
          <th>Pasta de Origem</th>
          <th>Subpasta</th>
          <th>Post (Título)</th>
          <th>Arquivo</th>
        </tr>
  `;

  // Gerar cada linha da tabela para cada post
  report.forEach(post => {
    const folders = post.folderPath.split(path.sep);   // Separar pastas
    const originFolder = folders[0];                   // Pasta de origem
    const subfolder = folders.slice(1).join('/');      // Subpasta (se existir)
    
    htmlContent += `
        <tr>
          <td>${originFolder || 'N/A'}</td>
          <td>${subfolder || 'N/A'}</td>
          <td>${post.title}</td>
          <td>${post.fileName}</td>
        </tr>
    `;
  });

  htmlContent += `
      </table>
      </div>
    </body>
    </html>
  `;

  // Salvar o relatório em formato HTML
  fs.writeFileSync('./relatorio_posts_completo.html', htmlContent);
  console.log('Relatório HTML gerado com sucesso!');
}

generateHTMLReport();
