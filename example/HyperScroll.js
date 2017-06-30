(function() {

    //environment variables
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var scrollTop = 0;

    //global properties
    var placeholders = [];
    var placeholderCount = 0;
    var itemCount = 0;
    var preparedItems = [];

    //get data container
    var container = document.getElementById('hyperscroll');

    //get template and figure out properties
    var template = {
        node: container.firstElementChild,
        width: container.firstElementChild.offsetWidth,
        height: container.firstElementChild.offsetHeight
    };

    //remove template
    container.removeChild(template.node);

    //load items
    loadItems();

    //calculate layout
    calculateLayout();

    //add the placeholder
    addPlaceholders();

    //set event listeners
    setListeners();

    function calculateLayout() {
        //the number of placeholders to add plus a few more
        placeholderCount = (windowHeight * 1.5) / template.height;

        //update container height to the max size required
        container.style.height = (itemCount * template.height) + 'px';

        //TODO take into account margins and padding
    }

    function addPlaceholders() {

        for (var n = 0; n < placeholderCount; n++) {

            //clone template node
            var node = template.node.cloneNode(true);

            //set node position absolute
            var nodeOffset = n * template.height

            node.style.position = "absolute";
            node.style.top = nodeOffset + "px";

            // store the placeholders
            placeholders.push({
                node: node,
                top: nodeOffset,
                index: n
            });

            //add cloned node to container
            container.appendChild(node);

            //render
            renderTemplate(node, preparedItems[n]);
        }
    }

    function loadItems() {
        itemCount = 100000;

        for(var i = 0; i < itemCount; i++) {
            preparedItems.push({
                top: i * template.height,
                data: i,
                rendered: false
            });
        }
    }

    function renderTemplate(element, preparedItem) {
        element.innerHTML = "";

        var text = document.createElement('h3');
        text.innerHTML = 'Item - ' + preparedItem.data;

        element.appendChild(text);
    }

    function setListeners() {
        window.addEventListener("resize", onResize);
        window.addEventListener("scroll", onScroll);
    }

    function destroyListeners() {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scroll", onScroll);
    }

    function onResize() {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;

        //recalculate layout
        calculateLayout();

        //TODO if window grows add more placeholders
    }

    function onScroll() {
        var newScrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

        findUnrenderedItems(newScrollTop);

        //store the new scroll position
        scrollTop = newScrollTop;
    }

    function findUnrenderedItems(scrollOffset) {

        var start = scrollOffset - template.height;
        var end = scrollOffset + windowHeight + template.height;

        for(var i = 0; i < preparedItems.length; i++) {
            if(preparedItems[i].top > start && preparedItems[i].top < end) {
                if(!preparedItems[i].rendered) {
                    var node = findUnrenderedPlaceholder(start, end);
                    //set rendered to true
                    preparedItems[i].rendered = true;

                    //update position
                    placeholders[node.index].top = preparedItems[i].top;
                    placeholders[node.index].node.style.top = preparedItems[i].top + "px";

                    renderTemplate(placeholders[node.index].node, preparedItems[findItemAtPosition(placeholders[node.index].top)]);
                }
            }
            else {
                if(preparedItems[i].rendered) {
                    preparedItems[i].rendered = false;
                }
            }
        }
    }

    function findUnrenderedPlaceholder(start, end) {
        for(var p = 0; p < placeholders.length; p++) {
            if(placeholders[p].top < start || placeholders[p].top > end) return placeholders[p];
        }
    }

    function findItemAtPosition(top) {
        return top / template.height;
    }

})();
