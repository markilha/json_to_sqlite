"use client";
import React, { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [json, setJson] = useState(null);
  const [sql, setSql] = useState("");
  const [nameTable, setNameTable] = useState("");

  function converterJsonEmSql(json) {
    // Verificar se o json é válido
    if (json && typeof json === "object") {
      // Inicializar uma variável para armazenar o sql
      let sql = "";
      // Iterar sobre as chaves do json
      for (let chave in json) {
        // Obter o valor da chave
        let valor = json[chave];

        // Verificar se o valor é um objeto
        if (typeof valor === "object") {
          // Converter o valor em sql recursivamente
          let subsql = converterJsonEmSql(valor);

          // Adicionar o subsql ao sql com a chave como nome da tabela
          sql += `CREATE TABLE ${chave} (\n${subsql}\n);\n`;
        } else {
          // Adicionar o valor ao sql com a chave como nome da coluna e o tipo de dado adequado
          if (typeof valor === "string") {
            sql += `${chave} VARCHAR(255),\n`;
          } else if (typeof valor === "number") {
            sql += `${chave} INT,\n`;
          } else if (typeof valor === "boolean") {
            sql += `${chave} BOOLEAN,\n`;
          }
        }
      }

      // Remover a última vírgula do sql
      sql = sql.slice(0, -2);

      // Retornar o sql
      return sql;
    } else {
      // Retornar uma mensagem de erro se o json não for válido
      return "O arquivo json não é válido.";
    }
  }
  function converterJsonEmSqliteInsert(json, nomeTabela) {
    if (json && typeof json === "object") {
      let sqlite = "";
      let chaves = Object.keys(json);
      let valores = Object.values(json);
      if (nomeTabela) {
        sqlite += `INSERT INTO ${nomeTabela} (${chaves.join(", ")}) VALUES (\n`;
      }

      for (let valor of valores) {
        if (typeof valor === "object") {
          let subsqlite = converterJsonEmSqliteInsert(valor, nameTable);
          sqlite += `${subsqlite}\n`;
        } else {
          if (typeof valor === "string") {
            sqlite += `'${valor}',\n`;
          } else {
            sqlite += `${valor},\n`;
          }
        }
      }
      sqlite = sqlite.slice(0, -2);

      if (nomeTabela) {
        sqlite += ");\n";
      }
      return sqlite;
    } else {
      return "O arquivo json não é válido.";
    }
  }

  function handleChange(event) {
    let arquivo = event.target.files[0];

    if (arquivo && arquivo.name.endsWith(".json")) {
      let leitor = new FileReader();
      leitor.onload = function (e) {
        let conteudo = e.target.result;
        try {
          let json = JSON.parse(conteudo);
          setJson(json);
          let sql = converterJsonEmSqliteInsert(json);
          setSql(sql);
        } catch (erro) {
          alert("O arquivo json não é válido.");
        }
      };
      leitor.readAsText(arquivo);
    } else {
      alert("Por favor, selecione um arquivo .json válido.");
    }
  }

  function handleClick() {
    if (sql) {
      let link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([sql], { type: "text/plain" }));
      link.download = "sql.sql";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Não há nada para salvar.");
    }
  }
  return (
    <div className={styles.pagina}>
      <h1>CONVERTER JSON PARA SQLITE</h1>
      <p>
        Selecione um arquivo
      </p>
      <input type="file" onChange={handleChange} />
      <input
        type="text"
        placeholder="Digite o nome da tabela"
        onChange={setNameTable}
      />
      <button onClick={handleClick}>Salvar</button>
      <pre>{sql}</pre>
    </div>
  );
}
