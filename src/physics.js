import Ammo from 'ammojs-typed';
export class PhysicsController{
    async init(){
        await Ammo(Ammo);
        const collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
        const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        const broadphase = new Ammo.btDbvtBroadphase();
        const solver = new Ammo.btSequentialImpulseConstraintSolver();
        const softBodySolver = new Ammo.btDefaultSoftBodySolver();
        this.world = new Ammo.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softBodySolver);
        this.world.setGravity(new Ammo.btVector3(0, 0, 0));
        this.world.getWorldInfo().set_m_gravity(new Ammo.btVector3(0, 0, 0));
        this.meshes = [];
    }

    createPlanet(objThree, radius, mass, pos, quat){
        var transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        var motionState = new Ammo.btDefaultMotionState(transform);

        const localInertia = new Ammo.btVector3(0, 0, 0);
        const physicsShape = new Ammo.btSphereShape(radius);
        physicsShape.calculateLocalInertia(mass, localInertia);

        var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
        var body = new Ammo.btRigidBody(rbInfo);
        this.world.addRigidBody(body);
        objThree.userData.physicsBody = body;
        body.mass = mass;
        this.meshes.push(objThree);
        return body;
    }
    applyImpulse(body, vector){
        body.applyCentralImpulse(new Ammo.btVector3(vector.x, vector.y, vector.z));
    }
    animate(delta){
        for(let objThree of this.meshes){
            for(let objThree2 of this.meshes){
                const body = objThree.userData.physicsBody;
                const body2 = objThree2.userData.physicsBody;
                if(body != body2){
                    const pos1 = this.getPosition(body);
                    const pos2 = this.getPosition(body2);
                    pos2.op_sub(pos1);
                    const force = pos2;
                    const mass = body.mass;
                    const mass2 = body2.mass;
                    const r = pos2.length();
                    if(r != 0){
                        force.op_mul((mass * mass2) / (r * r));
                        body.applyCentralForce(force);
                    }
                    pos1.__destroy__();
                    pos2.__destroy__();
                }
            }
        }
        if (delta > 0)
            this.world.stepSimulation(delta, 10);
        for(let objThree of this.meshes){
            this.syncPhysicsState(objThree);
        }            
    }

    getPosition(objPhys){
        const ms = objPhys.getMotionState();
        const transform = new Ammo.btTransform();
        ms.getWorldTransform(transform);
        var p = transform.getOrigin();
        const tmp = new Ammo.btVector3(p.x(), p.y(), p.z());
        transform.__destroy__();
        return tmp;
    }

    syncPhysicsState(objThree) {
        const objPhys = objThree.userData.physicsBody;
        const ms = objPhys.getMotionState();
        const transform = new Ammo.btTransform();
        ms.getWorldTransform(transform);
        var p = transform.getOrigin();
        var q = transform.getRotation();
        objThree.position.set(p.x(), p.y(), p.z());
        objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
        transform.__destroy__();
    }
    
}