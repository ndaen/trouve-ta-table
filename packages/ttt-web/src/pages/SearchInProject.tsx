import {useParams} from "react-router";

const SearchInProject = () => {
    const {projectId} = useParams();

    return (
        <div>
            <h1>Search in Project {projectId}</h1>
        </div>
    );
};

export default SearchInProject;