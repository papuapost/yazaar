function helloWorldInit(elButton, elDiv) {
    var handleClick = function(e) {
        elDiv.innerHTML = this.get("value");
        this.removeListener(handleClick);
    };
    elButton.on("click", handleClick, elButton); 
}