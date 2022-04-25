import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      const { error } = await supabase.auth.signIn({ email })
      if (error) throw error
      alert('Check your email for the login link!')
    } catch (error) {
      alert(error.error_description || error.message)
    } finally {
      // const user = supabase.auth.user();
      // console.log(user);
      // const addEmail = {
      //   email: email,
      //   id: user.id,
      //   updated_at: new Date()
      // };
      // let { error } = await supabase.from("profiles").upsert(addEmail, {
      //   returning: "minimal", // Don't return the value after inserting
      // });
      // console.log(error);
      // console.log("after inserting the email");
      setLoading(false)
    }
  }

  return (
    <div>
      <div aria-live="polite">
        <h1 className="header">ROXYCILS & BEAUTÉ</h1>
        <p className="description">Sign in via magic link with your email below</p>
        {loading ? (
          'Sending magic link...'
        ) : (
          <form onSubmit={handleLogin}>
            <label htmlFor="email"></label>
            <input
              id="email"
              className="inputField"
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="button block button--custom" aria-live="polite">
              Send magic link
            </button>
          </form>
        )}
      </div>
    </div>
  )
}