import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import "./TopBar.css";

export default function TopBar() {
  const { mode, content, logout } = useContent();

  return (
    <div className="topbar">
      <Link className="topbar__brand" to="/">
        💛  {content.product?.name || "LoveCard"}
      </Link>

      <div className="topbar__right">
        <span className="badge">{mode === "private" ? "PRIVADO" : "DEMO"}</span>

        {mode === "demo" ? (
          <Link className="btn btn--ghost" to="/login">
            Entrar
          </Link>
        ) : (
          <button className="btn btn--ghost" type="button" onClick={logout}>
            Sair
          </button>
        )}
      </div>
    </div>
  );
}
