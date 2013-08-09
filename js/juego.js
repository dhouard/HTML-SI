$(document).ready(function() {

    
    /* Definición de la variables globales */
    
    var contexto;
    var nave;
    var numNaves;
    var contadorNaveMuerta;
    var naveMuriendo;
    var naveExplota;
    var naveExplota1;
    var disparo;
    var disparoEnemigo;
    var disparosEnemigos = [];
    var posibilidadDisparoEnemigo;
    var extra;
    var defensas = [];
    var defensaX;
    var distancia;
    var explosion;
    var anchoCanvas, altoCanvas;
    var enemigos = [];
    var teclado = [];
    var movimientoConvoy;
    var contadorMovimiento;
    var fase;
    var factorMovimiento;
    var contadorExplosionExtra;
    var situacion;
    var puntos;
    
    /* Constantes */
    
    var AMIGO = 'amigo';
    var ENEMIGO = 'enemigo';
    var VIVO = 0;
    var TOCADO = 1;
    var MUERTO = 2;
    var VELOCIDAD_DISPARO = 10;
    var PAUSADO = 0;
    var TERMINADO = 1;
    var ENJUEGO = 2;
    
    
    var requestAnimation = function() {
        
        return (window.requestAnimationFrame ||
               window.webkitRequestAnimationFrame ||
               window.mozRequestAnimationFrame ||
               window.oRequestAnimationFrame ||
               window.msRequestAnimationFrame);
        
    }
     /* Vuelve a rellenar el array del convoy 
     * Incluyendo sus valores iniciales*/
    
    function iniciaConvoy() {
        
        enemigos = enemigos.filter(function(enemigo) {
            return false;
        })
        
        for (fila = 0; fila < 5; fila++) {
            for (columna = 0; columna < 11; columna++) {
                x = (columna*50)+75;
                y= (fila*35)+75;
                switch (fila) {
                    case 0: tipoEnemigo = tipo1;
                            break;
                    case 1:
                    case 2: tipoEnemigo = tipo2;
                            break;
                    case 3:
                    case 4: tipoEnemigo = tipo3;
                }
                enemigos.push({
                    x: x,
                    y: y,
                    tipo: tipoEnemigo,
                    sprite: 0,
                    estado: VIVO
                });
            }
        }
        
    }
    
    /* Función que se encarga de crear el array que 
     * contiene a los enemigos con sus propiedades */
    
    function defineConvoy() {
        
        /* Definimos los enemigos y sus tipos */

        var tipo1 = $('#tipo1')[0];

        var tipo2 = $('#tipo2')[0];

        var tipo3 = $('#tipo3')[0];

        var tipo1a = $('#tipo1a')[0];

        var tipo2a = $('#tipo2a')[0];

        var tipo3a = $('#tipo3a')[0];
        
        var enemigo = {
            x: 0,
            y: 0,
            tipo: '',
            sprite: 0,
            estado: VIVO
        }
        
        iniciaConvoy();
    }
    
    function defineExtra() {
        
        extra = {
            x: 0,
            y: 45,
            estado: MUERTO,
            visible: false,
            imagen: $('#extra')[0]
        }
        
    }
    
    function defineDefensa() {
        
        defensaImagen = $('#defensa')[0];
        
        var defensa = {
            x: 0,
            y: 0,
            imagen: ''
        }
        
        defensaX = distancia-(distancia/2);
        for (i = 1; i <= 4; i++) {
            
            xDef = defensaX;
            yDef = altoCanvas-100;
            contexto.drawImage(defensaImagen, xDef, yDef);
            defensaX += (distancia*2);
            defensas.push({
                x: xDef,
                y: yDef,
                imagen: defensaImagen
            })
        }    
        
    }
    
    function dibujaDefensas() {
        
        for (i in defensas) {
            contexto.drawImage(defensas[i].imagen, defensas[i].x, defensas[i].y);
        }
        
    }
    
    /* Añadimos los eventos que controlarán el teclado */
    
    function agregarEventos() {
        
        if (document.addEventListener) {
            document.addEventListener('keydown', teclaPulsada, true);
            document.addEventListener('keyup', teclaSoltada, true);
        }
        else {
            if (document.attachEvent) {
                document.attachEvent('keydown', teclaPulsada);
                document.attachEvent('keyup', teclaSoltada);
            }
        }
    }
    
    function cargarSonidos() {
        
        snd_explosion = new Audio('sounds/explosion.mp3');
        snd_disparo = new Audio('sounds/disparo.mp3');
        
    }
    
    /* Inicialización de variables y 
     * datos del programa */
    
    function definiciones() {
               
        /* Iniciamos el canvas y su contexto */

        canvas = $('#canvas')[0];
        anchoCanvas = canvas.width;
        altoCanvas = canvas.height;
        contexto = canvas.getContext('2d');


        /* Definimos la nave defensora */

        nave = {
            x: anchoCanvas/2,
            y: altoCanvas-30,
            imagen: $('#nave')[0]
        }
        
        naveExplota = $('#naveExplota')[0];
        naveExplota1 = $('#naveExplota1')[0];

        
        /* Definimos el convoy enemigo */
        
        defineExtra();
        
        /* definicion del disparo */
        
        disparo = {
            x: 0,
            y: 0,
            imagen: $('#disparo')[0],
            visible: false
        }
        
        disparoEnemigo = {
            x: 0,
            y: 0,
            imagen: $('#disparoEnemigo')[0],
            visible: false
        }
        
        /* explosión de enemigos */
        
        explosion = $('#explosion')[0];
        
        /* Defensas */
        
        distancia = anchoCanvas / 8;
        
        defineDefensa();
        
        cargarSonidos(); 
        
        agregarEventos();
    
    }
    
    function creaExtra() {
        
        extra.x = anchoCanvas;
        extra.imagen = $('#extra')[0];
        extra.estado = VIVO;
        extra.visible = true;
        
    }
    
    function mueveExtra() {
        
        if (extra.estado == VIVO) {
            if (extra.x-3 > -1*extra.imagen.width) { 
                extra.x -= 3;
            }
            else {
                borraExtra();
                extra.visible = false;
            }
        }
        
    }
    
    function dibujaExtra() {
        
        if (extra.estado != MUERTO) {
            if (extra.estado == TOCADO) {
                extra.imagen = explosion;
                if (contadorExplosionExtra <= 20) {
                    contadorExplosionExtra++;
                }
                else {
                    if (contadorExplosionExtra <= 40) {
                        contexto.save();
                        contexto.font = "12px Arial";
                        contexto.fillStyle = 'white';
                        contexto.fillText(puntosExtra.toString(), extra.x+10, extra.y+15);
                        puntos += puntosExtra;
                        dibujaMarcador();
                        contexto.restore();
                        contadorExplosionExtra++;
                    }
                    else {
                        extra.estado = MUERTO;
                        extra.visible = false;
                    }
                }
            }
            contexto.drawImage(extra.imagen, extra.x, extra.y);
        }

    }
    
    function borraExtra() {
        
        contexto.fillStyle = "#000000";
        contexto.fillRect(extra.x, extra.y, extra.imagen.width, extra.imagen.height);
        
    }
    
    function teclaPulsada(e) {
        
        if ((e.keyCode != 32) && 
            (String.fromCharCode(e.keyCode).toLocaleLowerCase() != 'p') &&
            (String.fromCharCode(e.keyCode).toLowerCase() != 's')) {
            if (!teclado[e.keyCode]) {
                teclado[e.keyCode] = true;
            }
        }
        else {
            if (String.fromCharCode(e.keyCode).toLowerCase() == 'p') {
                if (situacion == PAUSADO) {
                    situacion = ENJUEGO;
                    animacion = requestAnimation(juego);
                    animacion(juego);
                }
                else {
                    situacion = PAUSADO;
                }
            }
            else {
                if (String.fromCharCode(e.keyCode).toLowerCase() == 's') {
                    if (situacion == TERMINADO) {
                        situacion = ENJUEGO;
                        iniciaJuego();
                        animacion = requestAnimation(juego);
                        animacion(juego);
                    }
                }
                else {
                    if (!disparo.visible) {
                        disparar();
                    }
                }
            }

        }
        
    }
    
    function teclaSoltada(e) {
        teclado[e.keyCode] = false;
    }
    
    function dibujaMarcador() {
        
        contexto.save();
        contexto.fillStyle = '#000000';
        contexto.fillRect(0, 0, anchoCanvas, 24);
        contexto.drawImage(nave.imagen, 10, 0);
        contexto.font = '18px Helvetica, Arial, sans serif';
        contexto.fillStyle = '#FFFFFF';
        contexto.fillText(numNaves.toString(), 20+nave.imagen.width, 24);
        var medida = contexto.measureText('Puntos: '+puntos);
        contexto.fillText('Puntos: '+puntos, 630-medida.width, 24);
        contexto.restore();
        
    }
    
    /* Función que dibuja el convoy */
    
    function dibujaConvoy() {
        
        for (i in enemigos) {
            enemigo = enemigos[i];
            if (enemigo.estado == VIVO) {
                if (enemigo.sprite == 0) {
                    switch (enemigo.tipo) {
                        case tipo1: enemigo.tipo = tipo1a;
                                    break;
                        case tipo2: enemigo.tipo = tipo2a;
                                    break;
                        case tipo3: enemigo.tipo = tipo3a;
                    }
                }
                else {
                    switch (enemigo.tipo) {
                        case tipo1a: enemigo.tipo = tipo1;
                                     break;
                        case tipo2a: enemigo.tipo = tipo2;
                                     break;
                        case tipo3a: enemigo.tipo = tipo3;
                    }
                }
            }
            else {
                if (enemigo.estado == TOCADO) {
                    enemigo.tipo = explosion;
                }
            }
            contexto.drawImage(enemigo.tipo, enemigo.x, enemigo.y);
        }
        
    }
    
    function borraConvoy() {
        
        for (i in enemigos) {
            enemigo = enemigos[i];
            contexto.fillStyle = '#000000';
            contexto.fillRect(enemigo.x, enemigo.y, enemigo.tipo.width, enemigo.tipo.height);
        }
        
    }
    
    /* Función que realiza una comprobación acerca de si 
     * el convoy ha llegado al límite izquierdo o derecho
     * de la pantalla. En ese caso, se baja una línea */
    
    function compruebaFinal() {
        
        var tope = false;
        var indice = 0;
        while (!tope && indice < enemigos.length) {
            enemigo = enemigos[indice];
            if ((enemigo.x+enemigo.tipo.width+5+movimientoConvoy > anchoCanvas) || 
                (enemigo.x+movimientoConvoy < 5)) {
                tope = true;
            }
            indice++
        }
        return tope;
    }
    
    /* Función que realiza el movimiento de las naves del convoy */
    
    function mueveConvoy() {
        
        var correccion = 0;
        
        contadorMovimiento++;
        if (contadorMovimiento >= factorMovimiento) {
            if (compruebaFinal(movimientoConvoy)) {
                movimientoConvoy *= -1;
                correccion = 10;
            }
            for (i in enemigos) {
                enemigo = enemigos[i];
                if (enemigo.estado == TOCADO) {
                    enemigo.estado = MUERTO;
                    factorMovimiento = (10-fase)*10-((55-enemigos.length)/2);
                }
                else {
                    if (correccion == 0) {
                        enemigo.x += movimientoConvoy;
                        if (enemigo.sprite == 0) {
                            enemigo.sprite =  1;
                        }
                        else {
                            enemigo.sprite = 0;
                        }
                    }
                    else {
                        enemigo.y += correccion;
                        if (enemigo.y >= nave.y) {
                            naveMuerta();
                        }
                    }
                }
            }
            enemigos = enemigos.filter(function(elemento) {
                
                return (elemento.estado != MUERTO);
                
            })
            contadorMovimiento = 0;
        }
    }
    
    
    
    /* Dibujo de la nave */
    
    function dibujaNave() {
        
        contexto.drawImage(nave.imagen, nave.x, nave.y);
        
    }
    
    function borraNave() {
        
        contexto.fillStile = '#000000';
        contexto.fillRect(nave.x, nave.y, nave.imagen.width, nave.imagen.height);
        
    }
    
    /* Cambio de los valores horizontales de la nave defensora */
    
    function mueveNave() {
        
        if ((teclado[37]) && (nave.x-5 > 0)) {
            nave.x -= 5;
        }
        if ((teclado[39]) && (nave.x+nave.imagen.width+5 < anchoCanvas)) {
            nave.x += 5;
        }
        
    }
    
    function disparar() {
        
        disparo.x = nave.x+(nave.imagen.width/2);
        disparo.y = altoCanvas-35;
        disparo.visible = true;
        snd_disparo.play();
        
    }
    
    function mueveDisparo() {
        
        if (!colision(AMIGO)) {
            if (disparo.y-VELOCIDAD_DISPARO > 0) {
                disparo.y = disparo.y-VELOCIDAD_DISPARO;
            }
            else {
                disparo.visible = false;
            }
        }
        
        
    }
    
    function dibujaDisparo() {
        
        contexto.drawImage(disparo.imagen, disparo.x, disparo.y);
        
    }
    
    function borraDisparo() {
        
        contexto.fillStyle = "#000000";
        contexto.fillRect(disparo.x, disparo.y, disparo.imagen.width, disparo.imagen.height);
        
    }
    
    function sobreDefensa(disparoEnemigo) {
        
        var sobre = false;
        i = 0;
        while ((!sobre) && (i < 4)) {
            var defensa = defensas[i];
            sobre = (disparoEnemigo.x >= defensa.x) && (disparoEnemigo.x <= defensa.x+defensa.imagen.width);
            i++;
        }
        return sobre;
        
    }
    
    /* Función que se encargará del control de colisiones tanto de disparo de nuestra nave como de los enemigos 
     * Devolverá true en caso de haya habido una colisión */
    
    function colision(tipoDisparo) {
        
        var colision = false;
        var colorPunto;
        var xExp, yExp;
        
        /* El primer condicional comprobará las colisiones provocadas por 
         * nuestros disparos.
         */
        
        if (tipoDisparo == AMIGO) {
            
            /*
             * Lo primero será comprobar si golpeamos las defensas en su parte inferior.
             */
            
            if (disparo.y > defensas[0].y) {
                colorPunto = contexto.getImageData(disparo.x, disparo.y-1, 1, 1).data;
                if (colorPunto[0] != 0) {
                    for (n = 0; n < 150; n++) {
                        xExp = disparo.x+(Math.ceil(Math.random()*10+1)-5);
                        yExp = disparo.y+(Math.ceil(Math.random()*10+1)-5);
                        fillStyle = '#000000';
                        contexto.fillRect(xExp, yExp, 1, 1);
                    }
                    disparo.visible = false;
                    colision = true;
                }
            }
            
            /*
             * Ahora comprobamos si golpeamos algún alienígena del convoy.
             */
            
            i = 0;
            while ((!colision) && (i < enemigos.length)) {
                enemigo = enemigos[i];
                if (((disparo.x > enemigo.x) && (disparo.x < enemigo.x+enemigo.tipo.width)) 
                  && (disparo.y < enemigo.y+enemigo.tipo.height)
                  && (enemigo.estado == VIVO)) {
                    disparo.visible = false;
                    colision = true;
                    enemigo.estado = TOCADO;
                    puntos += 10;
                    dibujaMarcador();
                    if (!snd_explosion.ended) {
                        snd_explosion.pause();
                        snd_explosion.load();
                    }
                    snd_explosion.play();
                }
                i++;
            }
            
            /*
             * Por último, si el disparo ha atravesado el convoy sin chocar con nada
             * Veremos si choca con la nave extra, en el caso de que esté en pantalla
             */
            
            if ((!colision) && (extra.visible)) {
               if (disparo.y <= extra.y+extra.imagen.height) {
                   if ((disparo.x >= extra.x) && (disparo.x <= extra.x+extra.imagen.width)) {
                       colision = true;
                       disparo.visible = false;
                       extra.estado = TOCADO;
                       contadorExplosionExtra = 0;
                       puntosExtra = Math.ceil(Math.random(3))*100;
                       /* Aqui va el sonido de la muerte del extra */
                   }
               }
            }
        }
        
        /*
         * 
         * Ahora es el momento de comprobar las colisiones de los disparos alienígenas
         */
        else {
            /* Comprobamos si se golpea defensas */
            
            var punto;
            var ultimoAlienY = enemigos[enemigos.length-1].y+enemigos[enemigos.length-1].tipo.height;
            var i = 0;
            
            while ((!colision) && (i < disparosEnemigos.length)) {
                disparoEnemigo = disparosEnemigos[i];
                if (sobreDefensa(disparoEnemigo)) {
                    if ((disparoEnemigo.y > ultimoAlienY) && (disparoEnemigo.y > defensas[i].y)){
                        punto = contexto.getImageData(disparoEnemigo.x+1, disparoEnemigo.y+disparoEnemigo.imagen.height+1,1, 1).data;
                        if (punto[0] == 255) {
                            colision = true;
                            disparoEnemigo.visible = false;
                            for (n = 0; n < 150; n++) {
                                xExp = disparoEnemigo.x+1+(Math.ceil(Math.random()*10+1)-5);
                                yExp = disparoEnemigo.y+(Math.ceil(Math.random()*10+1)-5);
                                fillStyle = '#000000';
                                contexto.fillRect(xExp, yExp, 1, 1);
                            }
                        }
                    }
                }
                if (!colision) {
                    if ((disparoEnemigo.y > nave.y) && (disparoEnemigo.y < nave.y+nave.imagen.height) &&
                        (disparoEnemigo.x > nave.x) && (disparoEnemigo.x < nave.x+nave.imagen.width)) {
                        naveMuerta();
                        disparoEnemigo.visible = false;
                        colision = true;
                        }
                }
                i++;
            }
        }
        
        return colision;
        
    }
    
    function creaDisparosEnemigos() {
        
        for (i in enemigos) {
            enemigo = enemigos[i];
            if (Math.ceil(Math.random()*posibilidadDisparoEnemigo) == Math.ceil(posibilidadDisparoEnemigo/2)) {
                disparosEnemigos.push({
                   x: enemigo.x+(enemigo.tipo.width/2-1),
                   y: enemigo.y+enemigo.tipo.height+1,
                   imagen: $('#disparoEnemigo')[0],
                   visible: true
                });
            }
        }
        
    }
    
    function mueveDisparosEnemigos() {
        
        var disparoEnemigo;
        
        for (i in disparosEnemigos) {
            disparoEnemigo = disparosEnemigos[i];
            if (!colision(ENEMIGO)) {
                disparoEnemigo.y += 5;
            }
            else {
                if (disparoEnemigo.y > altoCanvas-disparoEnemigo.imagen.height) {
                    disparoEnemigo.visible = false;
                }
            }
        }
        disparosEnemigos = disparosEnemigos.filter(function(disparoEnemigo) {
           return  (disparoEnemigo.visible == true);
        });
        
    }
    
    function dibujaDisparosEnemigos() {
        
        var disparoEnemigo;
        
        for (i in disparosEnemigos) {
            disparoEnemigo = disparosEnemigos[i];
            contexto.drawImage(disparoEnemigo.imagen, disparoEnemigo.x, disparoEnemigo.y);
        }
        
    }
    
    function borraDisparosEnemigos() {
        
        var disparoEnemigo;
        
        for (i in disparosEnemigos) {
            disparoEnemigo = disparosEnemigos[i];
            contexto.save();
            contexto.fillStile = "#000000";
            contexto.fillRect(disparoEnemigo.x, disparoEnemigo.y, 3, 13);
            contexto.restore();
        }
        
    }
    
    function naveMuerta() {
        
        naveMuriendo = true;
        numNaves--;
        dibujaMarcador();
        contadorNaveMuriendo = 0;
        
    }
    
    function iniciaJuego() {
        
        canvas.width = canvas.width;
        
        /* Definimos valores para el convoy enemigo */
        
        movimientoConvoy = 5;
        contadorMovimiento = 0;
        fase = 1;
        factorMovimiento = (10-fase)*10;
        
        posibilidadDisparoEnemigo = 5000;
        
        naveMuriendo = false;
        
        numNaves = 3;
        puntos = 0;
        
        dibujaMarcador();
        
        iniciaConvoy();
        dibujaConvoy();
        
        defineDefensa();
        dibujaDefensas();
        
        nave.imagen = $('#nave')[0];
        dibujaNave();
        situacion = ENJUEGO;
        
    }
    
    function juego() {
        
        if ((situacion == ENJUEGO) && (!naveMuriendo)) {
            borraConvoy();
            borraDisparo();
            borraNave();
            borraDisparosEnemigos();
            if (extra.visible) borraExtra();
            mueveConvoy();
            dibujaConvoy();
            if (extra.visible) {
                mueveExtra();
                dibujaExtra();
            }
            else {
                posibleSalida = Math.ceil(Math.random()*1500);
                if (posibleSalida == 750) {
                    creaExtra();
                }
            }
            mueveNave();
            dibujaNave();
            if (disparo.visible) {
                mueveDisparo();
                dibujaDisparo();
            }
            creaDisparosEnemigos();
            mueveDisparosEnemigos();
            dibujaDisparosEnemigos();
            animation(juego);
        }
        else {
            if (naveMuriendo) {
                if (contadorNaveMuriendo/10 == Math.ceil(contadorNaveMuriendo/10)) {
                    nave.imagen = nave.imagen == naveExplota ? naveExplota1 : naveExplota;
                }
                borraNave();
                contexto.drawImage(nave.imagen, nave.x, nave.y);
                contadorNaveMuriendo++;
                if (contadorNaveMuriendo > 200) {
                    if (numNaves >= 0) {
                        nave.imagen = $('#nave')[0];
                    }
                    else {
                        contexto.save();
                        contexto.fillStyle = '#00FF00';
                        contexto.font = '60px Helvetica, Arial, sans serif';
                        var medida = contexto.measureText('FINAL DE PARTIDA');
                        contexto.fillText('FINAL DE PARTIDA', (anchoCanvas-medida.width)/2, (altoCanvas-72)/2);
                        situacion = TERMINADO;
                        contexto.restore();
                    }
                    naveMuriendo = false;
                }
                animation(juego);
            }
        }
    }
    
    definiciones();
    iniciaJuego();
    var animation = requestAnimation(juego);
    animation(juego);


});