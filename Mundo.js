import * as THREE from 'https://unpkg.com/three@0.121.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'https://unpkg.com/three@0.121.1/examples/jsm/environments/RoomEnvironment.js';
import { Movimiento } from './Movimiento.js';
import {Objeto} from './Objeto.js';


export class Mundo{
    constructor(){
        this.objeto;
        this.camara = new THREE.PerspectiveCamera(20, window.innerWidth/window.innerHeight,1,1000);
        this.camara.position.z = 5;
        //Esta configuración hacer que las animaciones loopeen constantemente
        //THREE.LoopRepeat;

        this.renderizador = new THREE.WebGLRenderer();
        this.renderizador.setSize( window.innerWidth, window.innerHeight );

        document.body.appendChild( this.renderizador.domElement );
        this.guionCargado = false;
        this.deboActualizarCamara = false;
        this.deboActualizarAngulo = false;
        this.reloj = new Reloj();
        this.movimiento = new Movimiento(this,this.reloj);


        this.escena = new THREE.Scene();
        //El reloj de THREE es necesario para el timing de las animaciones
        this.clock = new THREE.Clock();
        //this.manager;
        //this.player = new Plyr('#audiop',{
        //    controls: [
        //        'volume'
        //   ]
        //});
        this.audio;// = new Audio('audios/audio.mp3');
        //this.setAudio('audios/audio.mp3');
    }

    crearManager(data){
        this.manager = new Manager(data);
        //this.audio = new Audio(this.data.anima[0].audio);
    }

    cargarObj(modelo){
        //Si modelo es un array va a cargar los modelos de a uno
        if (Array.isArray(modelo)){
            this.objeto = new Array(modelo.lenght);
            let x = 0;
            this.objeto[0] = new Objeto(this, modelo[x].mod, 0);
            for(let i=1; i<modelo.length-1; i++){
                let t = 1;
                this.objeto[i] = new Objeto(this, modelo[i].mod, 1);
                x = i;
            }
            this.objeto[x+1] = new Objeto(this, modelo[x+1].mod, 2);
        }else{
            //Crea el Objeto que carga el objeto gltf
            this.objeto = new Objeto(this, modelo, 3);
        }
    }
    //Asigna el objeto al mundo
    setObjeto(obj){
        this.objeto = obj;
    }
    //Crea los controles de la cámara
    crearOrbitControl(){
        this.controls = new OrbitControls( this.camara, this.renderizador.domElement );
		this.controls.minDistance = 1;
		this.controls.maxDistance = 1000;
        //Cosas que le metí para que sólo se pueda controlar con el guion
        /*this.controls.enableKeys = false;
        this.controls.enablePan = false;
        this.controls.enableRotate = false;
        this.controls.enableZoom = false;*/
    }
    iluminar(){
        //this.escena.add( new THREE.AmbientLight( 0xffffff ) );
        var luzd = new THREE.DirectionalLight( 0xffddcc, 1 );
        luzd.position.set( 1, 0.75, 0.5 );
        this.escena.add( luzd );
        var lud2 = new THREE.DirectionalLight( 0xccccff, 1 );
        lud2.position.set( - 1, 0.75, - 0.5 );
        this.escena.add( lud2 );
        this.renderizador.back;
    }

    animar(){
        if(this.deboActualizarCamara){
            this.deboActualizarCamara = this.movimiento.actualizarCamara();
        }
        if(this.deboActualizarAngulo){
            this.deboActualizarAngulo = this.movimiento.actualizarAngulo(this.objeto);
        }
    }

    renderizar(){
        if(this.objeto.modeloCargado){
            this.objeto.update(this.clock);
            //if (this.objeto.action.time>=this.objeto.clip.duration)this.objeto.action.paused = true;
            this.renderizador.render( this.escena, this.camara );
        }
        //if (this.objeto.mixer!=null)
        //console.log(this.escena.children.length);
    }

    moverCamara(indice){
        if(Array.isArray(this.objeto)){
            this.mo = this.objeto[this.objeto.length-1].modeloCargado;
        }else{
            this.mo = this.objeto.modeloCargado;
        }
        if(this.guionCargado && this.mo){
            this.movimiento.moverCamara(indice,this.objeto);
            this.deboActualizarCamara = true;
            //this.deboActualizarAngulo = true;

        }else{
            console.log(this.objeto)
            console.log('guion no esta listo');
        }
    }
    setGuion(guion){
        this.movimiento.setGuion(guion);
        this.guionCargado = true;
        this.moverCamara(0,this.zonas,this.modeloCargado);

        const pmremGenerator = new THREE.PMREMGenerator( this.renderizador );
        this.escena.background = new THREE.Color( 0xbfe3dd );
        if(guion.hasOwnProperty("fondo")){
            console.log(guion.fondo)
            this.escena.background = new THREE.Color( guion.fondo );
        }
        this.escena.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;
    }

    setTiempo(){
        //let indice = this.movimiento.encontrarTiempoMasCercano(ahorita);
        let indice = this.movimiento.encontrarTiempoMasCercano(this.reloj.t);
        this.moverCamara(indice);
    }

    setAudio(srcAudio){
        this.audio = document.createElement("source");
        this.audio.setAttribute("src", srcAudio);//"https://raw.githubusercontent.com/muhammederdem/mini-player/master/mp3/3.mp3");
        document.getElementById("audiop").append(this.audio);
        //this.audio.play();
        this.player.play();
    }


    actulizarConAudio(audio){
        /**/
        this.reloj.actualizar();
        if(this.guionCargado && audio.playing){
            if(audio.currentTime >= this.movimiento.siguienteTiempo){
                this.moverCamara(this.movimiento.siguienteTiempo);
            }
        }
    }

    actualizarSinAudio(){
        this.reloj.actualizar();
        //if(this.objeto.modeloCargado){
            //this.manager.update(this.player);
            //if(this.manager.getCambiar()){
                //this.audio = new Audio(this.manager.getAudio);
                //this.player.play();
                //this.setAudio(this.manager.getAudio());
                //this.objeto.playAnimation(this.manager.getAnimacion());
            //}
        //}
        //Esto está al pedo porque no se actualiza bien
        //if(this.guionCargado){
        //    if(this.reloj.t >= this.movimiento.siguienteTiempo){
        //        this.moverCamara(this.movimiento,siguienteTiempo);
        //    }
        //}
    }
}

class Reloj{
    constructor(){
        this.ultimo = performance.now();
        this.dt = 0;
        //Cosas para calcular el tiempo total de ejecución
        //this.inicio = Date.now();
        this.t = 0;
    }
        //myInterval = setInterval(tick, 0);

    //Calcula el deltaTime    
    actualizar() {
        let ahora = performance.now();
        this.dt = ahora - this.ultimo;
        this.ultimo = ahora;
        //Cosas para calcular el tiempo total de ejecución (no sirve)
        //if (this.guionCargado){
        //    this.t += this.getDelta()*.001;
        //}
        //(this.t).toFixed();
        //console.log(this.t); 
        //this.t = Date.now() - this.ahora;
    }

    getDelta(){
        return this.dt;
    }
}

class Manager{
    constructor(data){
        this.audio;
        this.ani;
        this.reloj = new Reloj();
        this.index = 0;
        this.puntos = data;
        this.cambiar = false;
        //this.time = 0;
        //this.ini = 0;
    }

    update(audio){
        if ((this.audio==null) && (this.ani==null)){
            this.audio = this.puntos[this.index].audio;
            this.ani = this.puntos[this.index].animacion;
            //this.time = this.puntos[this.index].tiempo;
            this.ini = this.reloj.ahora;
            this.cambiar = true;
        }else{
            if (audio != null){
                if (!audio.isPlaying){
                    if(this.index<this.puntos.length-1) this.index++;
                    this.audio = this.puntos[this.index].audio;
                    this.ani = this.puntos[this.index].animacion;
                    //this.time = this.puntos[this.index].tiempo;
                    this.cambiar = true;
                }else this.cambiar = false;
            }
        }
    }

    getAnimacion(){
        return this.ani;
    }

    getAudio(){
        return this.audio;
    }

    getCambiar(){
        return this.cambiar;
    }
}
