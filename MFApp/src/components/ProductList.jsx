import React, {lazy, Suspense} from "react";
const TodoApp = lazy(() => import("TodoAppHost/TodoApp"));

const ProductList = () => {
    return (
        <div className="todo-list-container">
            <Suspense fallback={null}>
            <TodoApp />
            </Suspense>
        </div>
    )
}

export default ProductList;
