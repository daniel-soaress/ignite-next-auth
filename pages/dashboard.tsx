import { useContext } from "react"
import { Can } from "../components/Can";
import { AuthContext } from "../contexts/AuthContext"
import { useCan } from "../hooks/useCan";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
    const { user, signOut, isAuthenticated } = useContext(AuthContext);

    return (
        <>
            <h1>Dashboard: {user.email}</h1>

            <button onClick={signOut}>Sing Out</button>

            <Can permissions={['metrics.list']}>
                <div>Métricas</div>
            </Can>
        </>
    )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    return { props: {} }
});
