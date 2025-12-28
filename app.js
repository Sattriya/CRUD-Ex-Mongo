const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const { body, validationResult, check } = require('express-validator')
const methodOverride = require('method-override')

require('./utils/db')
const Contact = require('./model/contact')

const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

const app = express()
const port = 3000

app.set('view engine', 'ejs')

app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({
    extended: true
}))
app.use(cookieParser('secret'))
app.use(session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))
app.use(flash())
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render('index', {
        nama: "Kibot",
        title: "Halaman Home",
        layout: 'layouts/main-layout'
    })
})

app.get('/about', (req, res) => {
    res.render('about', {
        title: "About",
        layout: 'layouts/main-layout'
    })
})

app.get('/contact', async (req, res) => {
    const contacts = await Contact.find()
    res.render('contact', {
        title: "Contact",
        layout: 'layouts/main-layout',
        contacts,
        msg: req.flash('msg')
    })
})

app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        title: "Halaman Tambah Contact",
        layout: 'layouts/main-layout'
    })
})

app.post('/contact', [
    body('nama').custom(async (value) => {
        const duplikat = await Contact.findOne({ nama: value })
        if (duplikat) {
            throw new Error('Nama sudah terdaftar, pilih nama lain!');
        }
        return true
    }),
    check('email', 'Email tidak valid!').isEmail(),
    check('nohp', 'No HP tidak valid!').isMobilePhone('id-ID')], (req, res) => {
        const err = validationResult(req)
        if (!err.isEmpty()) {
            res.render('add-contact', {
                title: "Halaman Tambah Contact",
                layout: 'layouts/main-layout',
                errors: err.array()
            })
        } else {
            Contact.insertMany(req.body).then((result) => {
                req.flash('msg', 'Data berhasil Ditambahkan!')
                res.redirect('/contact')
            })
        }
    })


app.delete('/contact', (req, res) => {
    const contact = Contact.findOne({ _id: req.body.id })

    Contact.deleteOne({ _id: req.body.id }).then(() => {
        req.flash('msg', 'Data berhasil Dihapus!')
        res.redirect('/contact')
    })
})

app.get('/contact/edit/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama })
    res.render('edit-contact', {
        title: "Halaman Edit Contact",
        layout: 'layouts/main-layout',
        contact
    })
})


app.put('/contact', [
    body('nama').custom(async (value, { req }) => {
        const duplikat = await Contact.findOne({ nama: value })
        if (value !== req.body.oldNama && duplikat) {
            throw new Error('Nama sudah terdaftar, pilih nama lain!');
        }
        return true
    }),
    check('email', 'Email tidak valid!').isEmail(),
    check('nohp', 'No HP tidak valid!').isMobilePhone('id-ID')], (req, res) => {
        const err = validationResult(req)
        if (!err.isEmpty()) {
            res.render('edit-contact', {
                title: "Halaman Edit Contact",
                layout: 'layouts/main-layout',
                errors: err.array(),
                contact: req.body
            })
        } else {
            Contact.updateOne({_id: req.body.id }, {
                $set: {
                    nama: req.body.nama,
                    email: req.body.email,
                    nohp: req.body.nohp
                }
            }).then(() => {
                req.flash('msg', 'Data berhasil Diubah!')
                res.redirect('/contact')
            })
        }
    })



app.get('/contact/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama })

    res.render('detail', {
        title: "Detail Contact",
        layout: 'layouts/main-layout',
        contact
    })
})

app.use('/', (req, res) => {
    res.status(404)
    res.send('<h1>404</h1>')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})