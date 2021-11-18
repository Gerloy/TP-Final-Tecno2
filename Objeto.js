import * as THREE from 'https://unpkg.com/three@0.122.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.122.0/examples/jsm/loaders/GLTFLoader.js';

function modelLoader(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, data=> resolve(data), null, reject);
  });
}

//Cambiar todo esto para cargar varios modelos
function cargarModelo0(archivo,mundo,objeto,loader){
    loader.load(archivo, function (gltf){
        //Recorre las zonas del objeto y las marca
        gltf.scene.traverse( function ( child ) {
                    let l = child.name.split('_');
                   objeto.zonas[child.name] = child;
               } );
        objeto.objeto = gltf;
        mundo.escena.add(objeto.objeto.scene);
    });
}
function cargarModelo1(archivo,mundo,objeto,loader){
    loader.load(archivo, function (gltf){
        objeto.objeto = gltf.scene;
        mundo.escena.add(gltf.scene);
    },undefined, function ( error ) {

        console.error( error );
    });
}
function cargarModelo2(archivo,mundo,objeto,loader){
    loader.load(archivo, function(gltf){
        objeto.objeto = gltf;
        mundo.escena.add(objeto.objeto.scene);
        
        objeto.modeloCargado = true;
        objeto.mundo.moverCamara(0);
    },undefined, function ( error ) {

        console.error( error );
    });
}
function cargarModelo3(archivo,mundo,objeto,loader,ani, action){
    loader.load(archivo, function (gltf){

        //Recorre las zonas del objeto y las marca
        gltf.scene.traverse( function ( child ) {
                let l = child.name.split('_');
                   objeto.zonas[child.name] = child;
               } );
        objeto.objeto = gltf;
        
        //Creo el animationMixer para cargar las animaciones
        objeto.ani = new THREE.AnimationMixer(gltf.scene);
        //var clips = gltf.animations;
        //objeto.clip = THREE.AnimationClip.findByName(gltf.animations, 'SphereAction');

        //Con esto se selecciona la animación que se va a reproducir
        //objeto.ani.clipAction(gltf.animations[0]).play();
        //objeto.ani.clipAction(objeto.clip).play();
        //objeto.action = objeto.ani.clipAction(action);
        //objeto.action.play();
        mundo.escena.add(objeto.objeto.scene);
        console.log(objeto.objeto.animations);
        //ani.clipAction(gltf.animations[0]).play();
        
        objeto.modeloCargado = true;
        objeto.mundo.moverCamara(0);
    });
}

export class Objeto{
    constructor(mundo, archivo, tipo){
        //crea un loader distinto para cada objeto por las dudas
        this.loader = new GLTFLoader();
        this.mundo = mundo;
        this.zonas = {};
        this.ani;
        this.clip;
        this.action;
        //this.angulo = 0;
        this.objeto = undefined;//new THREE.Object3D();
        this.modeloCargado = false;
        switch (tipo){
            case 0:
                cargarModelo0(archivo,mundo,this,this.loader);
            break;
            case 1:
                cargarModelo1(archivo,mundo,this,this.loader);
            break;
            case 2:
                cargarModelo2(archivo,mundo,this,this.loader);
            break;
            case 3:
                cargarModelo3(archivo,mundo,this,this.loader,this.ani,this.action);
            break;
        }
    }

    update(clock){
        if(this.ani) this.ani.update(clock.getDelta());
    }

    playAnimation(nombre){
        this.clip = THREE.AnimationClip.findByName(this.objeto.animations, nombre);
        console.log(nombre);
        this.action = this.ani.clipAction(this.clip);
        this.action.setLoop(THREE.LoopOnce);
        this.action.play().reset();
        //this.ani.clipAction(this.clip).play();
    }
}
