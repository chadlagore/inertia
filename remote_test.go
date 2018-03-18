package main

import (
	"fmt"
	"io"
	"io/ioutil"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/ubclaunchpad/inertia/client"
)

func TestRemoteAddWalkthrough(t *testing.T) {
	config := &client.Config{Remotes: make([]*client.RemoteVPS, 0)}
	in, err := ioutil.TempFile("", "")
	assert.Nil(t, err)
	defer in.Close()

	fmt.Fprintln(in, "pemfile")
	fmt.Fprintln(in, "user")
	fmt.Fprintln(in, "0.0.0.0")
	fmt.Fprintln(in, "master")

	_, err = in.Seek(0, io.SeekStart)
	assert.Nil(t, err)

	err = addRemoteWalkthrough(in, "inertia-rocks", "8080", "22", "dev", config)
	r, found := config.GetRemote("inertia-rocks")
	assert.True(t, found)
	assert.Equal(t, "pemfile", r.PEM)
	assert.Equal(t, "user", r.User)
	assert.Equal(t, "0.0.0.0", r.IP)
	assert.Nil(t, err)
}

func TestRemoteAddWalkthroughFailure(t *testing.T) {
	config := &client.Config{Remotes: make([]*client.RemoteVPS, 0)}
	in, err := ioutil.TempFile("", "")
	assert.Nil(t, err)
	defer in.Close()

	fmt.Fprintln(in, "pemfile")
	fmt.Fprintln(in, "")

	_, err = in.Seek(0, io.SeekStart)
	assert.Nil(t, err)

	err = addRemoteWalkthrough(in, "inertia-rocks", "8080", "22", "dev", config)
	assert.Equal(t, errInvalidUser, err)

	in.WriteAt([]byte("pemfile\nuser\n\n"), 0)
	_, err = in.Seek(0, io.SeekStart)
	assert.Nil(t, err)

	err = addRemoteWalkthrough(in, "inertia-rocks", "8080", "22", "dev", config)
	assert.Equal(t, errInvalidAddress, err)
}
