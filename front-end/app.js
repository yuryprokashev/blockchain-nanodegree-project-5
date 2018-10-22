const RequestType = {
    CREATE: "resource:create",
    PRESENT: "resource:present",
    READ: "resource:read"
};
const Resource = {
    STAR: "stars",
    TRANSACTION: "transaction"
};

const PresentType = {
    SUCCESS: "success",
    ERROR: "error"
};

const Styles = {
    ALERT_SUCCESS: "alert alert-success",
    ALERT_ERROR: "alert alert-danger",
    TX_ERROR: "btn btn-outline-danger",
    TX_ONGOING: "btn btn-outline-warning",
    TX_CONFIRMED: "btn btn-outline-success"
};

class App {
    constructor(resourceName, element, broker, requestFactory){
        this._requestType = RequestType.CREATE;
        this._resourceName = resourceName;
        this._element = element;
        this._broker = broker;
        this._requestFactory = requestFactory;
        this._element.addEventListener("submit", this._onSubmit.bind(this));
    }

    _onSubmit(event) {
        event.preventDefault();
        let request = this._requestFactory.createRequest(this._requestType, this._resourceName, event);
        console.log(request);
        this._broker.publish(request);
    }
}

class CreateResourceRequest {
    constructor(resourceName, resourceData) {
        this._resourceName = resourceName;
        this._resourceData = resourceData;
    }

    get resourceName() {
        return this._resourceName;
    }

    get resourceData() {
        return this._resourceData;
    }
}

class RequestFactory {
    constructor(){
        this._handlers = new Map();
        this._handlers.set(RequestType.CREATE, this._produceCreateRequest.bind(this));
        this._handlers.set(RequestType.READ, this._produceReadRequest.bind(this));
        this._handlers.set(RequestType.PRESENT, this._producePresentRequest.bind(this));

    }
    createRequest(requestType, requestData){
        if(this._handlers.has(requestType)) {
            let requestProducer = this._handlers.get(requestType);
            return requestProducer(requestData);
        } else {
            throw new Error(`Request Configuration not found for ${requestType}`);
        }
    }
    _produceCreateRequest(requestData) {
        let resourceName = requestData.resource;
        let data = requestData.data;
        return new CreateResourceRequest(resourceName, data);
    }
    _produceReadRequest(requestData) {

    }
    _producePresentRequest(requestData) {
        let resourceName = requestData.resource;
        let presentationType = requestData.type;
        let data = requestData.data;
        return new PresentationRequest(resourceName, presentationType, data);
    }
}

class Broker {
    constructor(){
        this._subscribers = [];
    }
    publish(request){
        this._subscribers.forEach(subscriber => {
            subscriber(request);
        });
    }
    subscribe(subscriber) {
        this._subscribers.push(subscriber);
    }
}

class CreateStarService{
    constructor(broker, requestFactory, contract, wallet){
        this._broker = broker;
        this._requestFactory = requestFactory;
        this._contract = contract;
        this._wallet = wallet;
    }
    async execute(request){
        let s = request.resourceData;
        try{
            let txHash = await this._contract.createStar(s.name, s.story, s.ra, s.dec, s.mag,
                {from: this._wallet.accounts(0)});
            let presentationRequest = this._requestFactory.createRequest(RequestType.PRESENT,
                {
                    resource: Resource.TRANSACTION,
                    type: PresentType.SUCCESS,
                    data: `Transaction ${txHash} has been queued by the Network`
                });
            let createTxPollingJobRequest = this._requestFactory.createRequest(RequestType.CREATE,
                {
                    resource: Resource.TRANSACTION,
                    data: txHash
                });
            broker.publish(presentationRequest);
            broker.publish(createTxPollingJobRequest);
        } catch (e) {
            let presentationRequest = this._requestFactory.createRequest(RequestType.PRESENT,
                {
                    resource: Resource.TRANSACTION,
                    type: PresentType.ERROR,
                    data: `Transaction has been rejected by the Network`
                });
            broker.publish(presentationRequest);
        }
    }
}

class Wallet {
    constructor(web3Object){
        this._web3 = web3Object;
    }
    accounts(index){
        if(index === undefined) index = 0;
        return this._web3.eth.accounts[index];
    }
    provider() {
        return this._web3.currentProvider;
    }
}

class Presenter {
    constructor(element, resourceName, style) {
        this._element = element;
        this._resourceName = resourceName;
        this._style = style;
    }
    present(presentationRequest) {
        if(presentationRequest._mustBeHandled()) {
            this._element.innerText = presentationRequest.data;
            this._element.setAttribute("class", this._style);
        }
    }
    _mustBeHandled(presentationRequest) {
        return presentationRequest.resourceName === this._resourceName && presentationRequest.presentType === PresentType.ERROR;
    }
}

class HiddenPresenter extends Presenter {
    present(presentationRequest) {
        if(presentationRequest._mustBeHandled()) {
            super.present(presentationRequest);
            this._show();
            setTimeout(()=> {
                this._hide();
            }, 10000);
        }
    }
    _show(){
        this._element.hidden = false;
    }
    _hide() {
        this._element.hidden = true;
    }
}

class PresentationRequest {
    constructor(resourceName, presentType, data){
        this._resourceName = resourceName;
        this._type = presentType;
        this._data = data;
        this._presentType = presentType;
    }

    get resourceName() {
        return this._resourceName;
    }

    get presentType() {
        return this._presentType;
    }

    get data() {
        return this._data;
    }
}