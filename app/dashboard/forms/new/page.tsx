import CollectionFormEditor from "./_components/CollectionFormEditor";
import { createCollectionForm } from "./actions";

const NewFormPage = () => {
  return (
    <CollectionFormEditor createCollectionAction={createCollectionForm} />
  );
};

export default NewFormPage;
