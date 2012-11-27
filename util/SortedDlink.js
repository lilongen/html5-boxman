/**
 * Base data structure
 * Used by Astar algorithm implement - AstarPath
 * 
 * sorted double link list
 * Function: add data object, and specail the sorted key field
 *           SortedDlink will maintain a SortedKeyField increaing list
 * 
 * by: lilong'en(lilongen@gmail.com)
 *   
 */
boxman.util.linkItem = function(nodeIdx, value) {
    this.nodeIdx = nodeIdx;   
    this.value = value;
    this.next = null;
    this.before = null;
};

boxman.util.SortedDlink = function() {};
jQuery.extend(boxman.util.SortedDlink.prototype, {
    
    _head: null,
    
    _length: 0,
    
    _hashIdx: {},
    
    add: function(nodeIdx, value) {
        var newItem = new boxman.util.linkItem(nodeIdx, value);
        this._hashIdx[newItem.nodeIdx + ''] = 1;
        if (!this._head) {
            this._head = newItem;
            this._head.next = this._head;
            this._head.before = this._head;
            this._length++;
                        
            return;
        }
        
        var linkPoint = this._head;
        //clockwise fetching, large --> small
        while (true) {
            if (newItem.value >= linkPoint.value ) {
                currBefore = linkPoint.before;
                currBefore.next = newItem;
                newItem.before = currBefore;
                newItem.next = linkPoint;
                linkPoint.before = newItem;
                
                if (linkPoint == this._head) {
                    this._head = newItem;
                }
                this._length++;
                
                return;
            }
            
            linkPoint = linkPoint.next;
            if (linkPoint == this._head) {
                break;
            }
        }
        
        //anti-clockwise fetching, small --> large
        linkPoint = this._head.before;
        while (true) {
            if (newItem.value < linkPoint.value ) {
                currNext = linkPoint.next;
                currNext.before = newItem;
                linkPoint.next = newItem;
                newItem.next = currNext;
                newItem.before = linkPoint;
                this._length++;
                
                return;
            }
            
            linkPoint = linkPoint.before;
            if (linkPoint == this._head) {
                break;
            }            
        }        
    },

    popup: function() {
        var last = this._head.before;
        this._hashIdx[last.nodeIdx + ''] = 0;
        
        var lastBefore = last.before;
        lastBefore.next = this._head;
        this._head.before = lastBefore;
        this._length--;
        
        if (this._length == 0) {
            this._head = null;
        }
                
        return last;
    },
    
    contain: function(key) {
        return this._hashIdx[key];
    },
    
    clear: function() {
        while (this._length) {
            var before = this._head.before;
            var beforeBefore = before.before;
            this._head.before = beforeBefore;
            beforeBefore.next = this._head;
            delete before;
            this._length--;
        }
        
        for (var strIdx in this._hashIdx) {
            delete this._hashIdx[strIdx];    
        }
        this._head = null;
    },
    
    length: function() {
        return this._length;   
    }
});