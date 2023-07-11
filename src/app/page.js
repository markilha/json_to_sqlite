"use client";
import React, { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [json, setJson] = useState(null);
  const [sql, setSql] = useState("");
  const [keys, setKeys] = useState("");
  const [tableName, setTableName] = useState(""); // State for table name input

  function converterJsonEmMysqlInsert(jsonArray, nomeTabela, chaves) {
    let mysql = "";

    for (let json of jsonArray) {
      if (json && typeof json === "object") {
        let valores = [];
        if (nomeTabela) {
          mysql += `INSERT INTO ${nomeTabela} (${chaves.join(
            ", "
          )}) VALUES (\n`;
        }

        for (let chave of chaves) {
          let valor = json[chave];
          if (typeof valor === "object") {
            let submysql = converterJsonEmMysqlInsert(
              valor,
              null,
              Object.keys(valor)
            );
            mysql += `${submysql}\n`;
          } else {
            if (typeof valor === "string") {
              mysql += `'${valor.replace(/'/g, "\\'")}',\n`; // escape single quotes
            } else {
              mysql += `${valor},\n`;
            }
          }
          valores.push(valor);
        }
        mysql = mysql.slice(0, -2);

        if (nomeTabela) {
          mysql += ");\n";
        }
      } else {
        return "O arquivo json não é válido.";
      }
    }
    return mysql;
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
          let sql = converterJsonEmMysqlInsert(
            json,
            tableName,
            keys.split(",")
          );
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

  function handleKeysChange(event) {
    setKeys(event.target.value);
  }

  function handleTableNameChange(event) {
    setTableName(event.target.value);
  }

  return (
    <div className={styles.pagina}>
      <h3>CONVERTER JSON PARA SQLITE</h3>
      <div className={styles.corpo}>
        <p>Inserir nome da tabela:</p>
        <input
          type="text"
          value={tableName}
          onChange={handleTableNameChange}
        />{" "}
      </div>
      <div className={styles.corpo}>

      <p>Inserir chaves (separadas por vírgula):</p>
      <input type="text" value={keys} onChange={handleKeysChange} />
      </div>
      <div className={styles.corpo}>
      <p>Selecione um arquivo</p>
      <input type="file" onChange={handleChange} />

      </div>
   
      <button onClick={handleClick}>Salvar</button>
      {/* <pre>{sql}</pre> */}
    </div>
  );
}
