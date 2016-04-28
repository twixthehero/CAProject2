test = {
    a: 1,
    b: 2,
    c: function() { console.log( this.a, this.b ) }
}

test.c()
