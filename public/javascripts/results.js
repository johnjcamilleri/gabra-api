/* globals Vue axios confirm GabraAPI */
/* eslint-disable no-new */
const baseURL = GabraAPI.baseURL
const pageURL = GabraAPI.pageURL
const urlParams = new URLSearchParams(window.location.search)
const isPending = window.location.pathname.includes('pending')
new Vue({
  el: '#app',
  data: {
    working: false,
    lexemeID: GabraAPI.lexeme_id,
    query: urlParams.get('s'),
    page: 1,
    results: [],
    resultCount: '…',
    loggedIn: GabraAPI.checkLoggedIn(),
    errors: []
  },
  computed: {
    moreResults: function () {
      return Number.isInteger(this.resultCount) && this.results.length < this.resultCount
    }
  },
  mounted: function () {
    if (this.lexemeID) {
      this.loadLexeme()
    } else if (isPending || this.query) {
      this.loadResults()
    }

    // https://renatello.com/check-if-a-user-has-scrolled-to-the-bottom-in-vue-js/
    window.onscroll = () => {
      let bottomOfWindow = Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop) + window.innerHeight === document.documentElement.offsetHeight
      if (bottomOfWindow && !this.working && this.moreResults) {
        this.loadResults(++this.page)
      }
    }
  },
  methods: {
    handleError: function (error) {
      this.errors.push(error)
    },
    clearErrors: function () {
      this.errors = []
    },

    // get lexeme
    loadLexeme: function () {
      this.working = true
      this.clearErrors()
      axios.get(`${baseURL}/lexemes/${this.lexemeID}`)
        .then(response => {
          this.resultCount = 1
          let r = {
            lexeme: response.data,
            lexemeFields: this.collectLexemeFields(response.data),
            wordforms: null // not loaded (yet)
          }
          this.results = [r]
          axios.get(`${baseURL}/lexemes/wordforms/${response.data._id}`)
            .then(resp => {
              r.wordforms = resp.data
              r.wordformFields = this.collectWordformFields(resp.data)
            })
            .catch(error => {
              console.error(error)
              r.wordforms = []
            })
        })
        .catch(this.handleError)
        .then(() => {
          this.working = false
        })
    },
    // get search results / pending
    loadResults: function (page = 1) {
      this.working = true
      this.clearErrors()
      let url, opts
      if (isPending) {
        url = `${baseURL}/feedback/suggest`
        opts = {
          params: {
            sort: urlParams.get('sort'), // 'oldest', 'newest'
            page: page
          }
        }
      } else {
        url = `${baseURL}/lexemes/search`
        opts = {
          params: {
            s: this.query,
            l: 1,
            wf: 1,
            g: 1,
            pending: 1,
            page: page
          }
        }
      }
      axios.get(url, opts)
        .then(response => {
          this.resultCount = response.data.query.result_count
          response.data.results.forEach(r => {
            r.error = null
            r.wordforms = null // not loaded (yet)
            r.lexemeFields = this.collectLexemeFields(r.lexeme)
            this.results.push(r)
            axios.get(`${baseURL}/lexemes/wordforms/${r.lexeme._id}`)
              .then(resp => {
                r.wordforms = resp.data
                r.wordformFields = this.collectWordformFields(resp.data)
              })
              .catch(error => {
                r.error = error
                r.wordforms = []
              })
          })
        })
        .catch(this.handleError)
        .then(() => {
          this.working = false
        })
    },
    timestampFromId: function (objectId) {
      // https://steveridout.github.io/mongo-object-time/
      return new Date(parseInt(objectId.substring(0, 8), 16) * 1000)
    },
    collectLexemeFields: function (lexeme) {
      if (!lexeme) return []
      let fields = new Set(['lemma'])
      for (let f in lexeme) {
        fields.add(f)
      }
      let exclude = new Set(['_id'])
      exclude.forEach((f) => fields.delete(f))
      return Array.from(fields)
    },
    collectWordformFields: function (wordforms) {
      if (!wordforms || wordforms.length === 0) return []
      let fields = new Set(['surface_form'])
      for (let i = 0; i < wordforms.length; i++) {
        for (let f in wordforms[i]) {
          fields.add(f)
        }
      }
      let exclude = new Set(['_id', 'lexeme_id'])
      exclude.forEach((f) => fields.delete(f))
      // TODO sort fields
      return Array.from(fields)
    },
    approveLexeme: function (id) {
      if (!id) return
      this.clearErrors()
      axios.post(`${baseURL}/lexemes/unset/${id}`, {
        'pending': 1
      })
        .then(response => {
          window.location = `${pageURL}/view/${id}`
        })
        .catch(this.handleError)
    },
    approveAllWordforms: function (lexeme_id) {
      let lexeme = this.results.find(r => r.lexeme._id === lexeme_id)
      if (!lexeme) return
      lexeme.wordforms.forEach(wf => {
        this.approveWordform(wf._id)
      })
    },
    approveWordform: function (wf_id) {
      if (!wf_id) return
      this.clearErrors()
      axios.post(`${baseURL}/wordforms/unset/${wf_id}`, {
        'pending': 1,
        'generated': 1
      })
        .then(response => {
          let lexeme_id = response.data.lexeme_id
          this.results.forEach(r => {
            if (r.lexeme._id === lexeme_id) {
              r.wordforms.forEach(wf => {
                if (wf._id === wf_id) {
                  Vue.delete(wf, 'generated')
                  Vue.delete(wf, 'pending')
                }
              })
            }
          })
        })
        .catch(this.handleError)
    },
    deleteLexeme: function (id) {
      if (!id) return
      if (!confirm(`Are you sure you want to delete lexeme ${id}?`)) return
      this.clearErrors()
      axios.delete(`${baseURL}/lexemes/${id}`)
        .then(response => {
          window.location.reload()
        })
        .catch(this.handleError)
    },
    deleteWordform: function (lexeme_id, wf_id) {
      if (!lexeme_id || !wf_id) return
      if (!confirm(`Are you sure you want to delete wordform ${wf_id}?`)) return
      this.clearErrors()
      axios.delete(`${baseURL}/wordforms/${wf_id}`)
        .then(response => {
          this.results.forEach(r => {
            if (r.lexeme._id === lexeme_id) {
              r.wordforms = r.wordforms.filter(wf => {
                return wf._id !== wf_id
              })
            }
          })
        })
        .catch(this.handleError)
    }
  }
})
