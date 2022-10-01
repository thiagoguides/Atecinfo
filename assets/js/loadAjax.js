



  function addHtml(file, tag){
    var element = document.getElementById(tag);
    if(element == null)
      return;

    element.innerHTML = getDocumento(file);

  }

  function getDocumento(documento){
    const xhttp = new XMLHttpRequest();
    let retorno;
    xhttp.onload = function()
    {   
     retorno = this.responseText;
    }
   xhttp.open("GET", documento, false);
   xhttp.send();

   return retorno;
  }

function escreveNoComponente(id, valor){
  let doc = document.getElementById(id);
  if(doc == null)
    return;
  doc.innerHTML = valor;
}
function adicionaAoComponente(id, valor){
  let doc = document.getElementById(id);
  if(doc == null)
    return;
  doc.innerHTML += valor;
}
 