from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

import pandas as pd
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/opioid_data.db'
db = SQLAlchemy(app)

Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)


Opioid = Base.classes.ConnecticutAccidentalDeath



@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

@app.route("/names")
def names():
    """Return a list of sample names."""

    # Use Pandas to perform the sql query
    stmt = db.session.query(Opioid).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    # Return a list of the column names (sample names)
    return jsonify(list(df.columns)[2:])

if __name__ == "__main__":
    app.run()

# stmt = db.session.query(Opioid).limit(10).statement
# df = pd.read_sql_query(stmt, db.session.bind)

# print(df)