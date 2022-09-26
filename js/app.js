let cliente = {
    mesa: '',
    hora: '',
    pedido: [

    ]
}

const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente')
btnGuardarCliente.addEventListener('click', guardarCliente)

function guardarCliente() {
    const mesa = document.querySelector('#mesa').value
    const hora = document.querySelector('#hora').value

    //Revisar si hay campos vacios
    const camposVacios = [mesa, hora].some(campo => campo === "")

    if (camposVacios) {
        Swal.fire({
            position: 'center',
            icon: 'warning',
            title: 'Ambos campos son obligatorios',
            showConfirmButton: false,
            timer: 1000
        })
        return
    }

    // Asignar datos del formulario
    cliente = {
        ...cliente, mesa, hora
    }

    //Ocultar modal
    const modalFormulario = document.querySelector('#formulario')
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario)
    modalBootstrap.hide()

    //Mostrar secciones
    mostrarSecciones()

    //Obtener platillos de la API
    obtenerPlatillos()
}

function obtenerPlatillos() {
    const url = "http://localhost:3000/platillos"

    fetch(url)
        .then(res => res.json())
        .then(data => mostrarPlatillos(data))
        .catch(e => console.log(e))
}

function mostrarPlatillos(platillos) {
    const contenido = document.querySelector('#platillos .contenido')

    platillos.forEach(platillo => {
        const row = document.createElement('div')
        row.classList.add('row', 'py-3', 'border-top')

        const nombre = document.createElement('div')
        nombre.classList.add('col-md-4')
        nombre.textContent = platillo.nombre


        const precio = document.createElement('div')
        precio.classList.add('col-md-3', 'fw-bold')
        precio.textContent = `$ ${platillo.precio}`

        const categoria = document.createElement('div')
        categoria.classList.add('col-md-3')
        categoria.textContent = categorias[platillo.categoria]

        const inputCantidad = document.createElement('input')
        inputCantidad.type = "number"
        inputCantidad.min = 0
        inputCantidad.id = `producto-${platillo.id}`
        inputCantidad.value = 0
        inputCantidad.classList.add('form-control')

        //Funcion que detecta la cantidad y el platillo que se esta agregando
        inputCantidad.onchange = function () {
            const cantidad = parseInt(inputCantidad.value)
            agregarPlatillo({ ...platillo, cantidad })
        };

        const agregar = document.createElement('div')
        agregar.classList.add('col-md-2')

        row.appendChild(nombre)
        row.appendChild(precio)
        row.appendChild(categoria)
        agregar.appendChild(inputCantidad)
        row.appendChild(agregar)
        contenido.appendChild(row)
    })
}

function agregarPlatillo(producto) {
    //Extraer el pedido actual 
    let { pedido } = cliente
    // revisar que la cantidad > 0
    if (producto.cantidad > 0) {
        //Comprueba si el elemento ya existe en el array
        if (pedido.some(articulo => articulo.id === producto.id)) {
            // El articulo ya existe, actualizar cantidad 
            const pedidoActualizado = pedido.map(articulo => {
                if (articulo.id === producto.id) {
                    articulo.cantidad = producto.cantidad
                }
                return articulo
            })
            // Se asigna el nuevo array a cliente pedido
            cliente.pedido = [...pedidoActualizado]
        } else {
            // El articulo no existe, lo agregamos al array.
            cliente.pedido = [...pedido, producto]
        }
    } else {
        const resultado = pedido.filter(articulo => articulo.id !== producto.id)
        cliente.pedido = [...resultado]
    }

    //Limpiar HTML previo
    limpiarHTML()

    if (cliente.pedido.length) {
        // Mostrar el resumen de los pedidos
        actualizarResumen()
    } else {
        mensajePedidoVacio()
    }

}


function actualizarResumen() {
    const contenido = document.querySelector('#resumen .contenido')

    const resumen = document.createElement('div')
    resumen.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow')

    // Informacion mesa
    const mesa = document.createElement('p')
    mesa.textContent = 'Mesa: '
    mesa.classList.add('fw-bold')

    const mesaSpan = document.createElement('span')
    mesaSpan.textContent = cliente.mesa
    mesaSpan.classList.add('fw-normal')

    mesa.appendChild(mesaSpan)

    // Infomracion Hora
    const hora = document.createElement('p')
    hora.textContent = 'Hora: '
    hora.classList.add('fw-bold')

    const horaSpan = document.createElement('span')
    horaSpan.textContent = cliente.hora
    horaSpan.classList.add('fw-normal')

    hora.appendChild(horaSpan)

    //Titulo de la sección
    const heading = document.createElement('h3')
    heading.textContent = "Platillos consumidos"
    heading.classList.add('my-4', 'text-center')

    //Iterar sobre los pedidos

    const grupo = document.createElement('ul')
    grupo.classList.add('list-group')

    const { pedido } = cliente

    pedido.forEach(articulo => {
        const { nombre, cantidad, precio, id } = articulo

        const lista = document.createElement('li')
        lista.classList.add('list-group-item')

        const nombreEl = document.createElement('h4')
        nombreEl.classList.add('my-4')
        nombreEl.textContent = nombre

        // Cantidad del articulo
        const cantidadEl = document.createElement('p')
        cantidadEl.classList.add('fw-bold')
        cantidadEl.textContent = 'Cantidad: '

        const cantidadValor = document.createElement('span')
        cantidadValor.classList.add('fw-normal')
        cantidadValor.textContent = cantidad

        // agregando valor al elemento
        cantidadEl.appendChild(cantidadValor)

        // Cantidad del articulo
        const precioEl = document.createElement('p')
        precioEl.classList.add('fw-bold')
        precioEl.textContent = 'Precio: '

        const precioValor = document.createElement('span')
        precioValor.classList.add('fw-normal')
        precioValor.textContent = `$ ${precio}`

        // agregando valor al elemento
        precioEl.appendChild(precioValor)

        // subtotal del articulo
        const subtotalEl = document.createElement('p')
        subtotalEl.classList.add('fw-bold')
        subtotalEl.textContent = 'Subtotal: '

        const subtotalValor = document.createElement('span')
        subtotalValor.classList.add('fw-normal')
        subtotalValor.textContent = calcularSubtotal(precio, cantidad)

        // agregando valor al elemento
        subtotalEl.appendChild(subtotalValor)

        //Boton para eliminar
        const btnEliminar = document.createElement('button')
        btnEliminar.classList.add('btn', 'btn-danger')
        btnEliminar.textContent = 'Eliminar del Pedido'

        btnEliminar.onclick = function () {
            eliminarProducto(id)
        }


        // agregar elementos al li
        lista.appendChild(nombreEl)
        lista.appendChild(cantidadEl)
        lista.appendChild(precioEl)
        lista.appendChild(subtotalEl)
        lista.appendChild(btnEliminar)


        // agregar lista al grupo principal
        grupo.appendChild(lista)
    })

    resumen.appendChild(heading)
    resumen.appendChild(mesa)
    resumen.appendChild(hora)
    resumen.appendChild(grupo)
    contenido.appendChild(resumen)

    //Mostrar fomrulario propina
    formularioPropinas()
}

function eliminarProducto(id) {
    const { pedido } = cliente
    const resultado = pedido.filter(articulo => articulo.id !== id)
    cliente.pedido = [...resultado]

    //Limpiar HTML previo
    limpiarHTML()

    if (cliente.pedido.length) {
        // Mostrar el resumen de los pedidos
        actualizarResumen()
    } else {
        mensajePedidoVacio()
    }

    const productoEliminado = `#producto-${id}`
    const inputEliminado = document.querySelector(productoEliminado)
    inputEliminado.value = 0
}

function calcularSubtotal(precio, cantidad) {
    return `$ ${precio * cantidad}`
}


function limpiarHTML() {
    const contenido = document.querySelector('#resumen .contenido')
    while (contenido.firstChild) {
        contenido.removeChild(contenido.firstChild)
    }
}

function mostrarSecciones() {
    const seccionesOcultas = document.querySelectorAll('.d-none')
    seccionesOcultas.forEach(seccion => {
        seccion.classList.remove('d-none')
    })
}

function mensajePedidoVacio() {
    const contenido = document.querySelector('#resumen .contenido')
    const texto = document.createElement('p')
    texto.classList.add('text-center')
    texto.textContent = "Añade los elementos del pedido"

    contenido.appendChild(texto)

}

function formularioPropinas() {
    const contenido = document.querySelector('#resumen .contenido')

    const formulario = document.createElement('div')
    formulario.classList.add('col-md-6', 'formulario')

    const divFormulario = document.createElement('div')
    divFormulario.classList.add('card', 'py-2', 'px-3', 'shadow')

    const heading = document.createElement('h3')
    heading.classList.add('my-4', 'text-center')
    heading.textContent = "Propina"

    // Radio button 10%
    const radio10 = document.createElement('input')
    radio10.type = "radio"
    radio10.name = "propina"
    radio10.value = "10"
    radio10.classList.add('form-check-input')
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement('label')
    radio10Label.textContent = '10%'
    radio10Label.classList.add('form-check-label')

    const radio10Div = document.createElement('div')
    radio10Div.classList.add('form-check')

    radio10Div.appendChild(radio10)
    radio10Div.appendChild(radio10Label)


    // Radio button 25%
    const radio25 = document.createElement('input')
    radio25.type = "radio"
    radio25.name = "propina"
    radio25.value = "25"
    radio25.classList.add('form-check-input')
    radio25.onclick = calcularPropina;


    const radio25Label = document.createElement('label')
    radio25Label.textContent = '25%'
    radio25Label.classList.add('form-check-label')

    const radio25Div = document.createElement('div')
    radio25Div.classList.add('form-check')

    radio25Div.appendChild(radio25)
    radio25Div.appendChild(radio25Label)

    // Radio button 50
    const radio50 = document.createElement('input')
    radio50.type = "radio"
    radio50.name = "propina"
    radio50.value = "50"
    radio50.classList.add('form-check-input')
    radio50.onclick = calcularPropina;


    const radio50Label = document.createElement('label')
    radio50Label.textContent = '50%'
    radio50Label.classList.add('form-check-label')

    const radio50Div = document.createElement('div')
    radio50Div.classList.add('form-check')

    radio50Div.appendChild(radio50)
    radio50Div.appendChild(radio50Label)


    divFormulario.appendChild(heading)
    divFormulario.appendChild(radio10Div)
    divFormulario.appendChild(radio25Div)
    divFormulario.appendChild(radio50Div)
    formulario.appendChild(divFormulario)
    contenido.appendChild(formulario)
}

function calcularPropina() {

    const { pedido } = cliente
    let subtotal = 0;

    pedido.forEach(articulo => {
        subtotal += articulo.cantidad * articulo.precio
    })

    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value

    // calcular propina
    const propina = ((subtotal * parseInt(propinaSeleccionada)) / 100)

    // calcular total
    const total = subtotal + propina
    mostrarTotal(subtotal, total, propina)
}

function mostrarTotal(subtotal, total, propina) {

    const divTotal = document.createElement('div')
    divTotal.classList.add('total-pagar')

    // subtotal

    const subtotalParrafo = document.createElement('P')
    subtotalParrafo.classList.add('fs-5', 'fw-bold', 'mt-5')
    subtotalParrafo.textContent = "Subtotal: "

    const subtotalSpan = document.createElement('span')
    subtotalSpan.classList.add('fw-normal')
    subtotalSpan.textContent = `$${subtotal}`

    subtotalParrafo.appendChild(subtotalSpan)

    // propina

    const propinaParrafo = document.createElement('P')
    propinaParrafo.classList.add('fs-5', 'fw-bold', 'mt-5')
    propinaParrafo.textContent = "Propina: "

    const propinaSpan = document.createElement('span')
    propinaSpan.classList.add('fw-normal')
    propinaSpan.textContent = `$${propina}`

    propinaParrafo.appendChild(propinaSpan)

    divTotal.appendChild(subtotalParrafo)
    divTotal.appendChild(propinaParrafo)

    // propina

    const TotalParrafo = document.createElement('P')
    TotalParrafo.classList.add('fs-5', 'fw-bold', 'mt-5')
    TotalParrafo.textContent = "Total: "

    const TotalSpan = document.createElement('span')
    TotalSpan.classList.add('fw-normal')
    TotalSpan.textContent = `$${total}`

    TotalParrafo.appendChild(TotalSpan)


    // Eliminar 
    const pagarDiv = document.querySelector('.total-pagar')
    if (pagarDiv) {
        pagarDiv.remove()
    }

    divTotal.appendChild(subtotalParrafo)
    divTotal.appendChild(propinaParrafo)
    divTotal.appendChild(TotalParrafo)

    const formulario = document.querySelector('.formulario > div')
    formulario.appendChild(divTotal)
}