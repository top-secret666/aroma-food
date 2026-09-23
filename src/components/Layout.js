import Navbar from "./Navbar"

export default function Layout({ children, bare = false }) {
  return (
    <div className={`shell ${bare ? "shell--bare" : ""}`}>
      {!bare && <Navbar />}
      <main className="shell__main">{children}</main>
      {!bare && (
        <footer className="footer">
          <p>Aroma · food delivery</p>
        </footer>
      )}
    </div>
  )
}
