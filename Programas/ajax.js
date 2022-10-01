addHtml("../Programas/cp-menu.html", "cp-menu");
addHtml("../Programas/cp-Conteudo.html", "cp-conteudo");

filtraProgramas("Todos");
  function filtraProgramas(categoria, componente){
    resetaCorBotao();
    if(componente != null)
      componente.style.backgroundColor = "#2a5775";
    
    escreveNoComponente('tituloPagina', categoria);
    escreveNoComponente("ListProgramas",geraCards(categoria));
 }

  function resetaCorBotao(){
    let buttons = document.getElementsByClassName('menuButton18');
    for(var i =0; i<buttons.length; i++){
      buttons[i].style.backgroundColor = "#1D3D52";
    }
  }

  function geraCards(cat)
  {
    let produtos = JSON.parse(getJson());
    let template = getCardProduto();

    let ret = "";

    for (var i = 0; i < produtos.length; i++) 
    {
      var prod = produtos[i];
      if(cat == 'Todos' || prod.cat.includes(cat))
      {
        let temp = template.toString();

        temp = temp.replace('%icone', prod.icon.toString());
        temp = temp.replace('%titulo', prod.titulo.toString());
        temp = temp.replace('%descricao', prod.descricao);
        temp = temp.replace('%download', prod.download);

        ret += temp;
      }      
    }
      if(ret == ""){
        ret = "<h3>Sem Resultado</h3>";
      }

    return ret;

  }
  function getJson()
  {
    return getDocumento("../Programas/list.json");
  }

  function getCardProduto()
  {
   return getDocumento("../Programas/cardPrograma.html");
  }