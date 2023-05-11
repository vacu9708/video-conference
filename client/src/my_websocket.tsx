 class My_websocket{
    targets: Map<string, any>;
    ws: any
    is_open: boolean
    constructor(address: string) {
        this.ws=new WebSocket(address)
        // console.log('my_websocket allocated')
        this.targets=new Map()
        this.is_open=false
        this.ws.onopen = () => {
            this.is_open=true
        }
        this.ws.onclose = (msg: any) => {
            console.log(msg)
        };
        this.ws.onerror = (error: any) => {
            console.log(error)
        };
        this.ws.onmessage=(msg: any)=>{
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
        this.ws.send(msg)
    }
}
// console.log('my_websocket imported')
export default My_websocket