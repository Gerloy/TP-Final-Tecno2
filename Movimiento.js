import * as THREE from 'https://unpkg.com/three@0.121.1/build/three.module.js';
export class Movimiento{
    constructor(m,reloj){
        this.mundo = m;
        this.destinoCamara = {
            position:new THREE.Vector3( 0, 0, 5 ),
            target:new THREE.Vector3( 0, 0, 0 )
        }
        this.movimientoTemporizado = {
            es:false,
            duracion:0,
            tiempo:0,
            distanciaCam:0,
            distanciaObj:0,
            vecCam: new THREE.Vector3(),
            vecObj: new THREE.Vector3(),
            vecRot:0,
            angulo:0
        }
        this.siguienteTiempo = 0;
        this.reloj = reloj;

    }

    actualizarCamara(){
        // console.log(this.reloj.getDelta());
        // console.log(this.movimientoTemporizado.distanciaCam*this.movimientoTemporizado.distanciaCam);

        if(this.movimientoTemporizado.es){

            //if(dCamara>0.01){
                this.movimientoTemporizado.vecCam.subVectors(this.destinoCamara.position,this.mundo.camara.position);
                this.movimientoTemporizado.distanciaCam = this.movimientoTemporizado.vecCam.length();
                let magCam = this.movimientoTemporizado.duracion<=0?this.movimientoTemporizado.vecCam.length():(this.movimientoTemporizado.distanciaCam*this.reloj.getDelta())/this.movimientoTemporizado.duracion;
                // let magCam = (this.movimientoTemporizado.distanciaCam*this.reloj.getDelta())/this.movimientoTemporizado.duracion;
                magCam = THREE.MathUtils.clamp(magCam,0,this.movimientoTemporizado.vecCam.length());
                this.movimientoTemporizado.vecCam.normalize();
                this.movimientoTemporizado.vecCam.multiplyScalar(magCam)
                this.mundo.camara.position.add(this.movimientoTemporizado.vecCam);
                this.mundo.controls.position0.set(this.mundo.camara.position.x,
                                                this.mundo.camara.position.y,
                                                this.mundo.camara.position.z);
        //    }
        //    if(dTarget>0.01){
                this.movimientoTemporizado.vecObj.subVectors(this.destinoCamara.target,this.mundo.controls.target);
                this.movimientoTemporizado.distanciaObj = this.movimientoTemporizado.vecObj.length();
                let magObj = this.movimientoTemporizado.duracion<=0?this.movimientoTemporizado.vecObj.length():(this.movimientoTemporizado.distanciaObj*this.reloj.getDelta())/this.movimientoTemporizado.duracion;
                // magObj = THREE.MathUtils.clamp(magObj,0,this.movimientoTemporizado.vecObj.length());
                this.movimientoTemporizado.vecObj.normalize();
                this.movimientoTemporizado.vecObj.multiplyScalar(magObj)
                this.mundo.controls.target.add(this.movimientoTemporizado.vecObj);
                this.mundo.controls.target0.set(this.mundo.controls.target.x,
                                                this.mundo.controls.target.y,
                                                this.mundo.controls.target.z);
            //}
            this.movimientoTemporizado.duracion -= this.reloj.getDelta();
            this.mundo.controls.update();
            if(this.movimientoTemporizado.duracion<=0){
                this.mundo.controls.reset();
                return false;
            }

        }else{
            let dCamara = this.mundo.camara.position.distanceToSquared(this.destinoCamara.position);
            let dTarget = this.mundo.controls.target0.distanceToSquared(this.destinoCamara.target);
            let factor = 0.1;
            if(dCamara>factor){
                this.mundo.camara.position.lerp(this.destinoCamara.position,0.05);
                this.mundo.controls.position0.lerp(this.destinoCamara.position,0.05);
            }
            if(dTarget>factor){
                this.mundo.controls.target.lerp(this.destinoCamara.target,0.05);
                this.mundo.controls.target0.lerp(this.destinoCamara.target,0.05);
            }
            this.mundo.controls.update();
            console.log(dCamara,dTarget);
            if(dCamara<factor && dTarget<factor){
                console.log("LISTOOO");
                this.mundo.controls.reset();
                return false;
            }

        }
        // this.mundo.controls.reset();
        return true;
    }

    actualizarAngulo(objeto){
        var PI = Math.PI;
        if(this.movimientoTemporizado.es){
            //asigno las variables necesarias
            var anguloObjetivo = this.movimientoTemporizado.angulo;
            var anguloActual = objeto.objeto.rotation.y;
            var anguloCambio = anguloObjetivo-anguloActual;
            var tiempoActual = this.movimientoTemporizado.tiempo;
            var tiempoObjetivo = this.movimientoTemporizado.duracion;
            var tiempoCambio = tiempoObjetivo-tiempoActual;
            var dt = this.reloj.getDelta();

            var anguloNextFrame = dt*anguloCambio/tiempoCambio;

            objeto.objeto.rotateY = anguloNextFrame;

            this.movimientoTemporizado.tiempo + dt;
            if (this.movimientoTemporizado.tiempo >= tiempoObjetivo)this.movimientoTemporizado.tiempo = 0;
        }else{
            objeto.objeto.rotation.y = this.movimientoTemporizado.angulo*(PI/180);
        }
    }

    setGuion(guion){
        this.guion = {};
        //this.guion[0] = {
        //    "tiempo":0,
        //    "nombre":"00:00",
        //    "camara":[0,0,5],
        //    "target":[0,0,0],
        //    "esTemporizado":false}

        //foreach que recorre el array "data" en el guión
        for(var cambio of guion.data){
            //Cambia el string tiempo del guión para pasarlo a un integer
            //y cambia el objeto del array "data" actual
            //para poder usar los el integer "tiempo" para activar el cambio de cámara
            let tiempo = this.deTextoATiempo(cambio.tiempo);
            this.guion[tiempo] = cambio;

            //Si el objeto del array "data" actual no tiene un parámetro que se llame "nombre"
            //se le asigna el mismo usando la variable "tiempo" como string
            if(!this.guion[tiempo].hasOwnProperty("nombre")){
                this.guion[tiempo]['nombre'] = this.guion[tiempo].tiempo;
            }
            this.guion[tiempo].tiempo = tiempo;

            //Si el objeto actual tiene un parámetro "duración" se cuenta como temporizado
            if(this.guion[tiempo].hasOwnProperty("duracion")){
                this.guion[tiempo]["esTemporizado"] = true;
            }else{
                this.guion[tiempo]["esTemporizado"] = false;
            }
        }
        //this.guionCargado = true;
        //this.moverCamara(0);
        // return true;
    }

    moverCamara(indice,objeto){
        //if(guionCargado){
            let nCamara = {};
            let nTarget = {};
            //Define la posición a la que se va a mover la cámara
            //tomando la que está en el array "data" del guión.
            //Si no se agregó un parámetro de posición para la cámara
            //en ese objeto, se usa la posición que tiene actualmente
            if(Array.isArray(this.guion[indice].camara)){
                nCamara.x = this.guion[indice].camara[0];
                nCamara.y = this.guion[indice].camara[1];
                nCamara.z = this.guion[indice].camara[2];
            }else{
                if(Array.isArray(this.mundo.objeto)){
                    nCamara = this.mundo.objeto[0].zonas[this.guion[indice].camara].position;
                }else{
                    nCamara = this.mundo.objeto.zonas[this.guion[indice].camara].position;
                }
                //nCamara = this.mundo.zonas[this.guion[indice].camara].position;
            }
            //Lo mismo que arriba pero para el punto al que mira
            if(Array.isArray(this.guion[indice].target)){
                nTarget.x = this.guion[indice].target[0];
                nTarget.y = this.guion[indice].target[1];
                nTarget.z = this.guion[indice].target[2];
            }else{
                if(Array.isArray(this.mundo.objeto)){
                    nTarget = this.mundo.objeto[0].zonas[this.guion[indice].target].position;
                }else{
                    nTarget = this.mundo.objeto.zonas[this.guion[indice].target].position;
                }
                //nTarget = this.mundo.zonas[this.guion[indice].target].position;
            }

            this.destinoCamara.position.x =  nCamara.x;
            this.destinoCamara.position.y =  nCamara.y;
            this.destinoCamara.position.z =  nCamara.z;
            this.destinoCamara.target.x =  nTarget.x;
            this.destinoCamara.target.y =  nTarget.y;
            this.destinoCamara.target.z =  nTarget.z;
            // this.deboActualizarCamara = true;

            //Si el cambio está temporizado en el guión
            //se añaden los valores referentesa a eso que hay en el mismo
            this.movimientoTemporizado.es = this.guion[indice].esTemporizado;

            //Se calcula la velocidad de la cámara
            if(this.movimientoTemporizado.es){
                this.movimientoTemporizado.duracion = this.guion[indice].duracion;
                this.movimientoTemporizado.angulo = this.guion[indice].angulo;
                this.movimientoTemporizado.distanciaCam = this.destinoCamara.position.distanceTo(this.mundo.camara.position);
                this.movimientoTemporizado.distanciaObj = this.destinoCamara.target.distanceTo(this.mundo.controls.target);
                this.movimientoTemporizado.vecCam.subVectors(this.destinoCamara.position,this.mundo.camara.position);
                this.movimientoTemporizado.vecObj.subVectors(this.destinoCamara.target,this.mundo.controls.target);
            }

            this.siguienteTiempo = this.encontrarSiguienteTiempo(indice);

            objeto.playAnimation(this.guion[indice].ani);


        /*}else{
            console.log(this.objeto)
            console.log('guion no esta listo');
        }*/
        //console.log(this.guion[indice].angulo);
    }
    deTextoATiempo(texto){
        //Divide a t en un array de 2 strings la primera para los minutos
        // y la segunda para los segundos
        var t = texto.split(':');
        var tFinal = 0;
        var nivel = 1;
        //Pasa los strings a un int que representa los segundos
        for(var i=t.length-1;i>=0;i--){
            tFinal += parseInt(t[i])*nivel;
            nivel*=60;
        }
        return tFinal;
    }
    encontrarTiempoMasCercano( indice ) {
        let tiempoActual = this.guion[indice].tiempo;
        let tiempo =Object.keys(this.guion);
        let tiempoSalto = 0;
        for(let i=0; i<tiempo.length;i++){
                if(tiempo[i]<=tiempoActual){
                        if(tiempo[i]>tiempoSalto){
                            tiempoSalto = tiempo[i];
                        }
                }
        }
        return tiempoSalto;
    }

    //Encuentra el tiempo en el que se va a realizar el siguiente cambio de cámara y lo devuelve
    encontrarSiguienteTiempo( tiempoActual ) {
        let tiempo =Object.keys(this.guion);
        let tiempoSalto = 60*60*60;
        for(let i=0; i<tiempo.length;i++){
                if(parseInt(tiempo[i])>tiempoActual){
                        if(parseInt(tiempo[i])<tiempoSalto){
                            tiempoSalto = parseInt(tiempo[i]);
                        }
                }
        }
        console.log(tiempoSalto);
        return tiempoSalto;
    }

}
