import React from "react"
import classes from "./../App.module.css"
import Navigation from "./Navigation"

function Main ({ title, children }) {
  return (
    <main className={classes.container} style={{ display: 'flex' }}>
      <aside className={classes.sidebar} style={{ flexGrow: 0 }} >
        <p className={classes.branding}>Automated Bulletin</p>
        <Navigation />
      </aside>
      <section className={classes.content} style={{ flexGrow: 1 }}>
        <h1>{title}</h1>
        {children}
        <section className={classes.footer}>
          &copy; { new Date().getFullYear()} Rights reserved
        </section>
      </section>
    </main>
  )
}

export default Main;
