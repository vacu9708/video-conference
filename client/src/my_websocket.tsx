class My_websocket extends WebSocket{
    targets: Map<string, any>;
    is_open: boolean
    constructor(address: string){
        super(address)
        this.targets=new Map()
        this.is_open=false
        this.onopen = () => {
            this.is_open=true
        }
        this.onclose = (msg: any) => {
            console.log(msg)
        }
        this.onerror = (error: any) => {
            console.log(error)
        }
        this.onmessage=(msg: any)=>{
            // console.log(msg.data)
            let json: any=JSON.parse(msg.data)
            if(this.targets.has(json.target))
                this.targets.get(json.target)(json)
        }
    }
    on(target: string, callback: (json: any)=>void){
        this.targets.set(target, callback)
    }
    send(msg: string){
        super.send(msg)
    }
}

// console.log('my_websocket imported')
export default My_websocket

// class My_websocket{ // without inheritance
//     targets: Map<string, any>;
//     ws: WebSocket
//     is_open: boolean
//     constructor(address: string) {
//         this.ws=new WebSocket(address)
//         // console.log('my_websocket allocated')
//         this.targets=new Map()
//         this.is_open=false
//         this.ws.onopen = () => {
//             this.is_open=true
//         }
//         this.ws.onclose = (msg: any) => {
//             console.log(msg)
//         };
//         this.ws.onerror = (error: any) => {
//             console.log(error)
//         };
//         this.ws.onmessage=(msg: any)=>{
//             // console.log(msg.data)
//             let json: any=JSON.parse(msg.data)
//             if(this.targets.has(json.target))
//                 this.targets.get(json.target)(json)
//         }
//     }
//     on(target: string, callback: (json: any)=>void){
//         this.targets.set(target, callback)
//     }
//     send(msg: string){
//         this.ws.send(msg)
//     }
// }